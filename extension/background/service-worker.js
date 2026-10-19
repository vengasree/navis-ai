
console.log("Navis AI background service started.");

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message?.type !== "ANALYZE_EMAIL") {
        return;
    }

    const email = message.data || {};

    const payload = {
        sender_name: email.sender_name || "",
        sender_email: email.sender_email || "",
        subject: email.subject || "",
        body: email.body || email.content || "",
        urls: Array.isArray(email.urls) ? email.urls : [],
        source: email.source || "gmail",
        direction: email.direction || "incoming",
        user_answers: Array.isArray(email.user_answers)
            ? email.user_answers
            : []
    };

    console.log("Navis sending email to backend:", {
        sender_email: payload.sender_email,
        subject: payload.subject,
        url_count: payload.urls.length,
        has_body: Boolean(payload.body),
        has_user_answers: payload.user_answers.length > 0
    });

    fetch("http://127.0.0.1:5000/analyse", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    })
        .then(async response => {
            const text = await response.text();

            let data;

            try {
                data = JSON.parse(text);
            } catch {
                throw new Error(
                    `Backend returned an invalid response (HTTP ${response.status}).`
                );
            }

            if (!response.ok) {
                throw new Error(
                    data.error || `Backend returned HTTP ${response.status}.`
                );
            }

            if (data.error) {
                throw new Error(data.error);
            }

            return data;
        })
        .then(result => {
            console.log("Navis backend response fields:", Object.keys(result));

            sendResponse({
                success: true,
                result
            });
        })
        .catch(error => {
            console.error("Navis AI backend error:", error);

            sendResponse({
                success: false,
                error: error.message || "Could not connect to the Navis backend."
            });
        });

    // Keep the message channel open until fetch finishes and sendResponse runs.
    return true;
});
