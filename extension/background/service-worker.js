console.log("Navis AI background service started.");


chrome.runtime.onMessage.addListener(
    (message, sender, sendResponse) => {

        if (message.type === "ANALYZE_EMAIL") {

            console.log(
                "Navis sending email to backend:",
                message.data
            );


            fetch("http://localhost:5000/analyse", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    sender_name:
                        message.data.sender_name || "",

                    sender_email:
                        message.data.sender_email || "",

                    subject:
                        message.data.subject || "",

                    body:
                        message.data.body ||
                        message.data.content ||
                        "",

                    urls:
                        message.data.urls || [],

                    source:
                        message.data.source ||
                        "gmail",

                    direction:
                        message.data.direction ||
                        "incoming",

                    /*
                     * User answers from the
                     * follow-up security questions.
                     */
                    user_answers:
                        message.data.user_answers || []

                })

            })

            .then(response => {

                if (!response.ok) {

                    throw new Error(
                        `Backend returned ${response.status}`
                    );

                }

                return response.json();

            })

            .then(result => {

                console.log(
                    "Navis backend result:",
                    result
                );

                sendResponse({

                    success: true,

                    result: result

                });

            })

            .catch(error => {

                console.error(
                    "Navis AI backend error:",
                    error
                );

                sendResponse({

                    success: false,

                    error: error.message

                });

            });


            /*
             * Required because fetch()
             * is asynchronous.
             */
            return true;
        }

    }
);