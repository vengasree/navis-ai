
console.log("Navis AI Gmail security agent loaded.");

let lastEmailSignature = "";
let analysisTimer = null;
let navisPanel = null;
let currentAnalysisId = 0;

function getEmailContent() {
    const subject =
        document.querySelector("h2.hP")?.innerText.trim() || "";

    const body =
        [...document.querySelectorAll("div.a3s")]
            .map(el => el.innerText.trim())
            .filter(Boolean)
            .sort((a, b) => b.length - a.length)[0] || "";

    const senderEl = document.querySelector("span.gD");

    const senderName =
        senderEl?.getAttribute("name") ||
        senderEl?.innerText.trim() ||
        "";

    let senderEmail =
        senderEl?.getAttribute("email") ||
        document.querySelector("span[email]")?.getAttribute("email") ||
        "";

    if (!senderEmail) {
        for (const el of document.querySelectorAll("[email]")) {
            const value = el.getAttribute("email");
            if (value && value.includes("@")) {
                senderEmail = value;
                break;
            }
        }
    }

    const urls = [
        ...new Set(
            [...document.querySelectorAll("div.a3s a[href]")]
                .map(a => a.href)
                .filter(href =>
                    href &&
                    !href.startsWith("mailto:") &&
                    !href.startsWith("javascript:")
                )
        )
    ];

    return {
        source: "gmail",
        direction: "incoming",
        sender_name: senderName,
        sender_email: senderEmail,
        subject,
        body,
        urls
    };
}

function isEmailOpen(email) {
    return Boolean(email.subject && email.body);
}

function createEmailSignature(email) {
    return [
        email.sender_email,
        email.subject,
        email.body.substring(0, 500)
    ].join("|");
}

function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, ch => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    }[ch]));
}

function createNavisPanel() {
    if (navisPanel && document.body.contains(navisPanel)) {
        return navisPanel;
    }

    navisPanel = document.createElement("div");
    navisPanel.id = "navis-security-panel";

    navisPanel.innerHTML = `
      <div id="navis-panel-header">
        <div style="display:flex;align-items:center;gap:9px">
          <div style="width:30px;height:30px;border-radius:8px;background:#2563eb;color:white;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:14px">N</div>
          <div>
            <div style="font-size:13px;font-weight:700;color:#0f172a">Navis AI</div>
            <div style="font-size:10px;color:#64748b">Personal AI Security Agent</div>
          </div>
        </div>
        <button id="navis-close" aria-label="Close Navis"
          style="border:none;background:none;font-size:20px;color:#64748b;cursor:pointer">×</button>
      </div>
      <div id="navis-panel-content">
        <div style="color:#64748b;font-size:11px">Analyzing this email...</div>
      </div>`;

    Object.assign(navisPanel.style, {
        position: "fixed",
        top: "80px",
        right: "22px",
        width: "350px",
        maxWidth: "calc(100vw - 24px)",
        maxHeight: "calc(100vh - 110px)",
        overflowY: "auto",
        background: "#fff",
        border: "1px solid #e2e8f0",
        borderRadius: "12px",
        boxShadow: "0 10px 30px rgba(15,23,42,.18)",
        zIndex: "2147483647",
        fontFamily: "Arial,sans-serif"
    });

    Object.assign(
        navisPanel.querySelector("#navis-panel-header").style,
        {
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 14px",
            borderBottom: "1px solid #e2e8f0"
        }
    );

    navisPanel.querySelector("#navis-panel-content").style.padding = "14px";

    navisPanel.querySelector("#navis-close").addEventListener("click", () => {
        navisPanel.remove();
        navisPanel = null;
    });

    document.body.appendChild(navisPanel);
    return navisPanel;
}

function showLoading(message = "Navis is scanning the email...") {
    const content =
        createNavisPanel().querySelector("#navis-panel-content");

    content.style.cssText = "padding:14px;color:#64748b;font-size:12px";
    content.textContent = message;
}

function renderReasons(reasons) {
    const unique = [
        ...new Set(
            (Array.isArray(reasons) ? reasons : [])
                .map(x => String(x || "").trim())
                .filter(Boolean)
        )
    ].slice(0, 4);

    if (!unique.length) {
        return "<li>No additional findings were returned by the analysis.</li>";
    }

    return unique.map(reason => `
      <li style="font-size:11px;line-height:1.5;margin-bottom:5px;color:#334155">
        ${escapeHtml(reason)}
      </li>`).join("");
}

function renderAssessment(result, email, isFinal = false) {
    result = result && typeof result === "object" ? result : {};

    const panel = createNavisPanel();
    const content = panel.querySelector("#navis-panel-content");

    const riskValue = String(result.risk_level || "Unknown");
    const risk = ["Low", "Moderate", "High", "Unknown"].includes(riskValue)
        ? riskValue
        : "Unknown";

    const riskColor =
        risk === "High" ? "#dc2626" :
        risk === "Moderate" ? "#ca8a04" :
        risk === "Low" ? "#16a34a" : "#64748b";

    const urgencyValue = String(result.urgency_level || "Low");
    const urgency = ["Low", "Medium", "High"].includes(urgencyValue)
        ? urgencyValue
        : "Low";

    const urgencyColor =
        urgency === "High" ? "#dc2626" :
        urgency === "Medium" ? "#ca8a04" : "#16a34a";

    const minutes = Math.max(1, Number(result.reading_time_minutes) || 1);

    const summary = String(
        result.email_summary ||
        "A summary could not be generated. Review the original email carefully."
    );

    const replyNeeded = String(result.reply_needed || "uncertain")
        .trim()
        .toLowerCase();

    const draftReply = String(result.draft_reply || "").trim();

    let html = `
      <div style="font-size:10px;color:#64748b;font-weight:700;letter-spacing:.5px;margin-bottom:6px">
        ${isFinal ? "FINAL EMAIL ASSESSMENT" : "EMAIL SECURITY ASSESSMENT"}
      </div>

      <div style="display:flex;align-items:center;gap:7px;margin-bottom:4px">
        <span style="width:8px;height:8px;border-radius:50%;background:${riskColor}"></span>
        <strong style="font-size:19px;color:#0f172a">
          ${escapeHtml(risk)} risk
        </strong>
      </div>

      <div style="font-size:11px;color:#475569;margin-bottom:13px">
        Decision: <strong>${escapeHtml(result.result || "Unverified")}</strong>
      </div>

      <div style="font-size:12px;font-weight:700;color:#0f172a;margin-bottom:6px">
        Email summary
      </div>
      <div style="font-size:11px;line-height:1.55;color:#334155;margin-bottom:12px;white-space:pre-wrap">
        ${escapeHtml(summary)}
      </div>

      <div style="font-size:12px;font-weight:700;color:#0f172a;margin-bottom:5px">
        What you need to do
      </div>
      <div style="font-size:11px;line-height:1.5;color:#334155;margin-bottom:12px">
        ${escapeHtml(result.action_needed || "Review the email and verify any requests independently.")}
      </div>

      <div style="font-size:12px;font-weight:700;color:#0f172a;margin-bottom:5px">
        Reply needed?
      </div>
      <div style="font-size:11px;line-height:1.5;color:#334155;margin-bottom:8px">
        ${escapeHtml(replyNeeded.toUpperCase())}
        ${result.reply_reason ? " — " + escapeHtml(result.reply_reason) : ""}
      </div>`;

    if (draftReply && replyNeeded !== "no") {
        html += `
          <div style="font-size:12px;font-weight:700;color:#0f172a;margin:10px 0 5px">
            Suggested reply (edit before using)
          </div>
          <textarea id="navis-reply-draft" rows="5"
            style="box-sizing:border-box;width:100%;resize:vertical;padding:8px;border:1px solid #cbd5e1;border-radius:7px;font:11px/1.5 Arial,sans-serif;color:#334155">${escapeHtml(draftReply)}</textarea>
          <button id="navis-copy-reply"
            style="margin:7px 0 14px;padding:7px 10px;border:0;border-radius:6px;background:#2563eb;color:white;cursor:pointer;font-size:11px">
            Copy draft
          </button>`;
    } else if (replyNeeded === "yes" && !draftReply) {
        html += `
          <div style="font-size:11px;line-height:1.5;color:#92400e;margin:6px 0 12px">
            A reply may be useful, but no draft was returned. Review the message and compose a reply only if the sender is trusted.
          </div>`;
    }

    html += `
      <div style="display:flex;gap:8px;margin:12px 0 14px">
        <div style="flex:1;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:9px">
          <div style="font-size:10px;color:#64748b;margin-bottom:4px">Urgency</div>
          <div style="font-size:12px;font-weight:700;color:${urgencyColor}">
            ${escapeHtml(urgency)}
          </div>
        </div>
        <div style="flex:1;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:9px">
          <div style="font-size:10px;color:#64748b;margin-bottom:4px">Reading time</div>
          <div style="font-size:12px;font-weight:700;color:#334155">~${minutes} min</div>
        </div>
      </div>

      <div style="font-size:12px;font-weight:700;color:#0f172a;margin-bottom:6px">
        Why Navis decided this
      </div>
      <ul style="margin:0;padding-left:18px">
        ${renderReasons(result.reasons)}
      </ul>`;

    const questions = Array.isArray(result.questions)
        ? result.questions.filter(q => typeof q === "string" && q.trim()).slice(0, 4)
        : [];

    if (!isFinal && result.needs_questions && questions.length) {
        html += `
          <div style="margin-top:14px;padding:11px;background:#eff6ff;border:1px solid #dbeafe;border-radius:9px">
            <div style="font-size:12px;font-weight:700;color:#1e3a8a;margin-bottom:6px">
              Help improve this assessment
            </div>
            <div style="font-size:10px;color:#64748b;margin-bottom:8px">
              Answer these short questions about the email.
            </div>`;

        questions.forEach((question, i) => {
            html += `
              <div style="margin-top:10px">
                <div style="font-size:11px;font-weight:600;color:#334155;margin-bottom:5px">
                  ${i + 1}. ${escapeHtml(question)}
                </div>
                <button class="navis-answer" data-index="${i}" data-answer="Yes"
                  style="padding:5px 12px;margin-right:5px;border:1px solid #cbd5e1;border-radius:6px;background:white;cursor:pointer;font-size:10px">
                  Yes
                </button>
                <button class="navis-answer" data-index="${i}" data-answer="No"
                  style="padding:5px 12px;border:1px solid #cbd5e1;border-radius:6px;background:white;cursor:pointer;font-size:10px">
                  No
                </button>
                <input type="hidden" id="navis-answer-${i}" value="">
              </div>`;
        });

        html += `
            <button id="navis-submit-answers"
              style="width:100%;margin-top:12px;padding:8px;border:none;border-radius:7px;background:#2563eb;color:white;font-weight:600;cursor:pointer;font-size:11px">
              Analyze My Answers
            </button>
          </div>`;
    }

    if (isFinal) {
        html += `
          <div style="margin-top:12px;padding-top:9px;border-top:1px solid #e2e8f0;font-size:10px;color:#64748b;line-height:1.5">
            This assessment uses email signals and your answers. Verify unexpected requests through a trusted channel.
          </div>`;
    }

    content.style.cssText = "padding:14px";
    content.innerHTML = html;

    const copyButton = panel.querySelector("#navis-copy-reply");

    if (copyButton) {
        copyButton.addEventListener("click", async () => {
            const draft = panel.querySelector("#navis-reply-draft");
            if (!draft) return;

            try {
                await navigator.clipboard.writeText(draft.value);
                copyButton.textContent = "Copied — paste into Gmail reply";
            } catch {
                draft.focus();
                draft.select();
                const copied = document.execCommand("copy");
                copyButton.textContent = copied
                    ? "Copied — paste into Gmail reply"
                    : "Select the draft and copy it";
            }
        });
    }

    panel.querySelectorAll(".navis-answer").forEach(button => {
        button.addEventListener("click", () => {
            const index = button.dataset.index;
            const input = panel.querySelector(`#navis-answer-${index}`);

            if (input) input.value = button.dataset.answer;

            panel.querySelectorAll(
                `.navis-answer[data-index="${index}"]`
            ).forEach(btn => {
                btn.style.background = "white";
                btn.style.color = "#334155";
                btn.style.borderColor = "#cbd5e1";
            });

            button.style.background = "#2563eb";
            button.style.color = "white";
            button.style.borderColor = "#2563eb";
        });
    });

    const submit = panel.querySelector("#navis-submit-answers");

    if (submit) {
        submit.addEventListener("click", async () => {
            const answers = [];

            for (let i = 0; i < questions.length; i++) {
                const answer =
                    panel.querySelector(`#navis-answer-${i}`)?.value;

                if (!answer) {
                    alert(`Please answer question ${i + 1}.`);
                    return;
                }

                answers.push({ question: questions[i], answer });
            }

            submit.disabled = true;
            submit.textContent = "Analyzing your answers...";

            try {
                const response = await chrome.runtime.sendMessage({
                    type: "ANALYZE_EMAIL",
                    data: { ...email, user_answers: answers }
                });

                if (!response?.success || !response.result) {
                    throw new Error(response?.error || "Follow-up analysis failed.");
                }

                renderAssessment(response.result, email, true);
            } catch (error) {
                submit.disabled = false;
                submit.textContent = "Try again";

                const note = document.createElement("div");
                note.style.cssText =
                    "margin-top:8px;color:#dc2626;font-size:11px";
                note.textContent = error.message || "Follow-up analysis failed.";
                content.appendChild(note);
            }
        });
    }
}

function showResult(result, email) {
    renderAssessment(result, email, false);
}

function showFinalResult(result, email = getEmailContent()) {
    renderAssessment(result, email, true);
}

async function analyzeCurrentEmail(force = false) {
    const email = getEmailContent();

    if (!isEmailOpen(email)) return;

    const signature = createEmailSignature(email);

    if (!force && signature === lastEmailSignature) return;

    lastEmailSignature = signature;
    const analysisId = ++currentAnalysisId;

    showLoading();

    try {
        const response = await chrome.runtime.sendMessage({
            type: "ANALYZE_EMAIL",
            data: email
        });

        if (analysisId !== currentAnalysisId) return;

        if (!response?.success || !response.result) {
            throw new Error(response?.error || "Backend analysis failed.");
        }

        showResult(response.result, email);
    } catch (error) {
        if (analysisId !== currentAnalysisId) return;

        console.error("Navis email analysis error:", error);

        const content =
            createNavisPanel().querySelector("#navis-panel-content");

        content.style.cssText =
            "padding:14px;color:#dc2626;font-size:11px;line-height:1.5";

        content.textContent =
            `Navis could not analyze this email: ${error.message}. Check that the backend is running, then refresh Gmail.`;
    }
}

function scheduleAnalysis() {
    clearTimeout(analysisTimer);
    analysisTimer = setTimeout(() => analyzeCurrentEmail(), 1200);
}

const observer = new MutationObserver(scheduleAnalysis);

if (document.body) {
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

setTimeout(() => analyzeCurrentEmail(), 2000);

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message?.type !== "GET_EMAIL") {
        return;
    }

    try {
        const email = getEmailContent();

        if (!email.body) {
            email.body = document.body?.innerText.trim() || "";
        }

        sendResponse({ success: true, data: email });
    } catch (error) {
        sendResponse({
            success: false,
            error: error.message || "Could not extract this email."
        });
    }

    // This handler responds synchronously.
});
