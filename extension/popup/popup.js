
document.getElementById("analyseBtn").addEventListener("click", analyzeCurrentEmail);

async function analyzeCurrentEmail() {
    const status = document.getElementById("status");
    const resultBox = document.getElementById("result");

    status.textContent = "Reading current email...";
    resultBox.innerHTML = "";

    try {
        const tabs = await chrome.tabs.query({
            active: true,
            currentWindow: true
        });

        if (!tabs[0]) {
            throw new Error("No active Gmail tab found.");
        }

        const emailResponse = await chrome.tabs.sendMessage(
            tabs[0].id,
            { type: "GET_EMAIL" }
        );

        if (!emailResponse?.success || !emailResponse.data) {
            throw new Error(
                emailResponse?.error || "Could not read Gmail content."
            );
        }

        const emailData = emailResponse.data;

        if (!emailData.subject && !emailData.body) {
            throw new Error(
                "No email content was found. Open an email in Gmail and try again."
            );
        }

        status.textContent = "Analysing with Navis AI...";

        const analysisResponse = await chrome.runtime.sendMessage({
            type: "ANALYZE_EMAIL",
            data: emailData
        });

        if (!analysisResponse?.success || !analysisResponse.result) {
            throw new Error(
                analysisResponse?.error || "Backend analysis failed."
            );
        }

        status.textContent = "Analysis complete.";
        renderResult(analysisResponse.result, emailData);
    } catch (error) {
        console.error("NAVIS ERROR:", error);
        status.textContent = "Error";

        resultBox.innerHTML = `
            <div class="final-card">
                <h3>Navis Error</h3>
                <p>${escapeHtml(error.message || "Something went wrong.")}</p>
                <p>Check that Gmail is open and the Navis backend is running.</p>
            </div>
        `;
    }
}

function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

function getRiskClass(riskLevel) {
    switch (String(riskLevel || "").toLowerCase()) {
        case "low":
            return "risk-low";
        case "moderate":
            return "risk-moderate";
        case "high":
            return "risk-high";
        default:
            return "risk-unknown";
    }
}

function renderList(items, emptyMessage) {
    const safeItems = Array.isArray(items)
        ? items.map(item => String(item ?? "").trim()).filter(Boolean)
        : [];

    if (!safeItems.length) {
        return `<li>${escapeHtml(emptyMessage)}</li>`;
    }

    return safeItems
        .map(item => `<li>${escapeHtml(item)}</li>`)
        .join("");
}

/*
 * Both the initial result and final result use this same renderer.
 * This prevents the final assessment from losing summary and action fields.
 */
function renderAssessment(result, emailData, isFinal = false) {
    const resultBox = document.getElementById("result");

    result = result && typeof result === "object" ? result : {};

    const riskLevel = String(result.risk_level || "Unknown");
    const riskClass = getRiskClass(riskLevel);
    const decision = String(result.result || "Unverified");

    const summary = String(
        result.email_summary ||
        "A summary was not returned. Review the original email carefully."
    );

    const actionNeeded = String(
        result.action_needed ||
        "Review the message and independently verify unexpected requests."
    );

    const replyNeeded = String(
        result.reply_needed || "Uncertain"
    );

    const replyReason = String(result.reply_reason || "").trim();
    const draftReply = String(result.draft_reply || "").trim();

    const urgencyValue = String(result.urgency_level || "Low");
    const urgency = ["Low", "Medium", "High"].includes(urgencyValue)
        ? urgencyValue
        : "Low";

    const readingMinutes = Math.max(
        1,
        Number(result.reading_time_minutes) || 1
    );

    const reasonsHtml = renderList(
        result.reasons,
        "No additional security findings were returned."
    );

    const questions = Array.isArray(result.questions)
        ? result.questions
            .filter(question => typeof question === "string" && question.trim())
            .slice(0, 4)
        : [];

    let html = `
        <div class="final-card">
            <div class="final-label">
                ${isFinal ? "FINAL NAVIS ASSESSMENT" : "NAVIS EMAIL ASSESSMENT"}
            </div>

            <div class="risk-badge ${riskClass}">
                <span class="risk-dot"></span>
                <h2>${escapeHtml(riskLevel)} Risk</h2>
            </div>

            <p class="decision">
                <strong>Decision:</strong>
                ${escapeHtml(decision)}
            </p>

            <h3>Email Summary</h3>
            <p class="assessment-text">${escapeHtml(summary)}</p>

            <h3>What You Need to Do</h3>
            <p class="assessment-text">${escapeHtml(actionNeeded)}</p>

            <h3>Reply Needed?</h3>
            <p class="assessment-text">
                <strong>${escapeHtml(replyNeeded.toUpperCase())}</strong>
                ${replyReason ? ` — ${escapeHtml(replyReason)}` : ""}
            </p>
    `;

    if (draftReply && replyNeeded.trim().toLowerCase() !== "no") {
        html += `
            <h3>Suggested Reply</h3>
            <p class="assessment-text">
                Review and edit this draft before using it. Do not reply
                if the sender or request is suspicious.
            </p>

            <textarea
                id="navis-popup-reply"
                rows="5"
                style="box-sizing:border-box;width:100%;resize:vertical;padding:8px;border:1px solid #cbd5e1;border-radius:7px;font:12px/1.5 Arial,sans-serif;"
            >${escapeHtml(draftReply)}</textarea>

            <button id="navis-popup-copy-reply" type="button">
                Copy Suggested Reply
            </button>
        `;
    }

    html += `
            <div class="assessment-meta">
                <div>
                    <small>Urgency</small>
                    <strong>${escapeHtml(urgency)}</strong>
                </div>
                <div>
                    <small>Reading Time</small>
                    <strong>~${readingMinutes} min</strong>
                </div>
            </div>

            <h3>Why Navis Decided This</h3>
            <ul>${reasonsHtml}</ul>
    `;

    if (!isFinal && result.needs_questions && questions.length > 0) {
        html += `
            <div class="followup-card">
                <div class="followup-header">
                    <span class="followup-icon">N</span>
                    <div>
                        <strong>Navis Security Check</strong>
                        <p>A few answers can help refine the assessment.</p>
                    </div>
                </div>
        `;

        questions.forEach((question, index) => {
            html += `
                <div class="followup-question">
                    <p>
                        <strong>${index + 1}. ${escapeHtml(question)}</strong>
                    </p>

                    <button
                        type="button"
                        class="yesNoButton"
                        data-index="${index}"
                        data-answer="Yes"
                    >Yes</button>

                    <button
                        type="button"
                        class="yesNoButton"
                        data-index="${index}"
                        data-answer="No"
                    >No</button>

                    <input
                        id="answer-${index}"
                        type="hidden"
                        value=""
                    >
                </div>
            `;
        });

        html += `
                <button id="submitAnswers" type="button">
                    Analyze My Answers
                </button>
            </div>
        `;
    }

    if (isFinal) {
        html += `
            <p class="final-message">
                Navis incorporated your answers into the final risk assessment.
                Verify unexpected requests through an independent, trusted channel.
            </p>
        `;
    }

    html += `</div>`;

    resultBox.innerHTML = html;

    attachCopyHandler();
    attachAnswerHandlers(questions, emailData, result, isFinal);
}

function attachCopyHandler() {
    const copyButton = document.getElementById("navis-popup-copy-reply");

    if (!copyButton) return;

    copyButton.addEventListener("click", async () => {
        const draft = document.getElementById("navis-popup-reply");

        if (!draft) return;

        try {
            await navigator.clipboard.writeText(draft.value);
            copyButton.textContent = "Copied";
        } catch (error) {
            draft.focus();
            draft.select();

            const copied = document.execCommand("copy");
            copyButton.textContent = copied
                ? "Copied"
                : "Select the text and copy it manually";
        }
    });
}

function attachAnswerHandlers(questions, emailData, result, isFinal) {
    document.querySelectorAll(".yesNoButton").forEach(button => {
        button.addEventListener("click", () => {
            const index = button.dataset.index;
            const answer = button.dataset.answer;
            const answerInput = document.getElementById(`answer-${index}`);

            if (answerInput) {
                answerInput.value = answer;
            }

            document.querySelectorAll(
                `.yesNoButton[data-index="${index}"]`
            ).forEach(otherButton => {
                otherButton.style.background = "white";
                otherButton.style.color = "#334155";
                otherButton.style.borderColor = "#cbd5e1";
            });

            button.style.background = "#2563eb";
            button.style.color = "white";
            button.style.borderColor = "#2563eb";
        });
    });

    const submitButton = document.getElementById("submitAnswers");

    if (!submitButton || isFinal) return;

    submitButton.addEventListener("click", async () => {
        const answers = [];

        for (let index = 0; index < questions.length; index++) {
            const answer = document.getElementById(`answer-${index}`)?.value;

            if (!answer) {
                alert(`Please answer question ${index + 1}.`);
                return;
            }

            answers.push({
                question: questions[index],
                answer
            });
        }

        submitButton.disabled = true;
        submitButton.textContent = "Navis is thinking...";

        const status = document.getElementById("status");
        status.textContent = "Re-evaluating with your answers...";

        try {
            const response = await chrome.runtime.sendMessage({
                type: "ANALYZE_EMAIL",
                data: {
                    ...emailData,
                    user_answers: answers
                }
            });

            if (!response?.success || !response.result) {
                throw new Error(
                    response?.error || "Follow-up analysis failed."
                );
            }

            status.textContent = "Final analysis complete.";

            // Use the same renderer as the initial assessment.
            renderAssessment(response.result, emailData, true);
        } catch (error) {
            console.error("FOLLOW-UP ERROR:", error);
            status.textContent = "Error";

            submitButton.disabled = false;
            submitButton.textContent = "Try again";

            const errorMessage = document.createElement("p");
            errorMessage.style.color = "#dc2626";
            errorMessage.textContent =
                error.message || "Follow-up analysis failed.";

            document.getElementById("result").appendChild(errorMessage);
        }
    });
}

function renderResult(result, emailData) {
    renderAssessment(result, emailData, false);
}
