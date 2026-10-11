document
    .getElementById("analyseBtn")
    .addEventListener("click", async () => {

        const status =
            document.getElementById("status");

        const resultBox =
            document.getElementById("result");


        status.innerText =
            "Reading current email...";

        resultBox.innerHTML = "";


        try {

            const tabs =
                await chrome.tabs.query({
                    active: true,
                    currentWindow: true
                });


            if (!tabs[0]) {

                throw new Error(
                    "No active Gmail tab found."
                );

            }


            const emailResponse =
                await chrome.tabs.sendMessage(
                    tabs[0].id,
                    {
                        type: "GET_EMAIL"
                    }
                );


            console.log(
                "Email response:",
                emailResponse
            );


            if (
                !emailResponse ||
                !emailResponse.success
            ) {

                throw new Error(
                    "Could not read Gmail content."
                );

            }


            status.innerText =
                "Analysing with Navis AI...";


            const analysisResponse =
                await chrome.runtime.sendMessage({

                    type:
                        "ANALYZE_EMAIL",

                    data:
                        emailResponse.data

                });


            console.log(
                "Analysis response:",
                analysisResponse
            );


            if (
                !analysisResponse ||
                !analysisResponse.success
            ) {

                throw new Error(
                    analysisResponse?.error ||
                    "Backend analysis failed."
                );

            }


            const result =
                analysisResponse.result;


            status.innerText =
                "Analysis complete.";


            renderResult(
                result,
                emailResponse.data
            );


        } catch (error) {

            console.error(
                "NAVIS ERROR:",
                error
            );


            status.innerText =
                "Error";


            resultBox.innerHTML = `

                <p>
                    <strong>
                        Navis Error
                    </strong>
                </p>

                <p>
                    ${error.message}
                </p>

            `;

        }

    });


/* ============================================================
   FIRST RESULT
   ============================================================ */

function renderResult(
    result,
    emailData
) {

    const resultBox =
        document.getElementById("result");


    let html = `

        <h2>
            ${result.risk_level}
        </h2>

        <p>
            <strong>
                Decision:
            </strong>

            ${result.result}
        </p>

        <h3>
            Security Analysis
        </h3>

        <ul>

            ${(result.reasons || [])
                .map(reason => `
                    <li>
                        ${reason}
                    </li>
                `)
                .join("")}

        </ul>

    `;


    /* ========================================================
       FOLLOW-UP
       ======================================================== */

    if (
        result.needs_questions &&
        result.questions &&
        result.questions.length > 0
    ) {

        html += `

            <div class="followup-card">

                <div class="followup-header">

                    <span class="followup-icon">
                        N
                    </span>

                    <div>

                        <strong>
                            Navis Security Check
                        </strong>

                        <p>
                            A few answers will help
                            improve the risk assessment.
                        </p>

                    </div>

                </div>

        `;


        result.questions.forEach(
            (question, index) => {

                html += `

                    <div
                        style="
                            margin-top: 13px;
                        "
                    >

                        <p>

                            <strong>

                                ${index + 1}.
                                ${question}

                            </strong>

                        </p>


                        <button
                            class="yesNoButton"
                            data-index="${index}"
                            data-answer="Yes"
                        >
                            Yes
                        </button>


                        <button
                            class="yesNoButton"
                            data-index="${index}"
                            data-answer="No"
                        >
                            No
                        </button>


                        <input
                            id="answer-${index}"
                            type="hidden"
                            value=""
                        >

                    </div>

                `;

            }
        );


        html += `

                <button
                    id="submitAnswers"
                >
                    Analyze My Answers
                </button>

            </div>

        `;

    }


    resultBox.innerHTML =
        html;


    /* ========================================================
       YES / NO
       ======================================================== */

    document
        .querySelectorAll(".yesNoButton")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const index =
                        button.dataset.index;

                    const answer =
                        button.dataset.answer;


                    document.getElementById(
                        `answer-${index}`
                    ).value =
                        answer;


                    document
                        .querySelectorAll(
                            `.yesNoButton[data-index="${index}"]`
                        )
                        .forEach(btn => {

                            btn.style.background =
                                "white";

                            btn.style.color =
                                "#334155";

                            btn.style.borderColor =
                                "#cbd5e1";

                        });


                    button.style.background =
                        "#2563eb";

                    button.style.color =
                        "white";

                    button.style.borderColor =
                        "#2563eb";

                }
            );

        });


    /* ========================================================
       ANALYZE ANSWERS
       ======================================================== */

    const submitButton =
        document.getElementById(
            "submitAnswers"
        );


    if (submitButton) {

        submitButton.addEventListener(
            "click",
            async () => {

                try {

                    const answers = [];


                    for (
                        let i = 0;
                        i < result.questions.length;
                        i++
                    ) {

                        const answer =
                            document.getElementById(
                                `answer-${i}`
                            ).value;


                        if (!answer) {

                            alert(
                                `Please answer question ${i + 1}.`
                            );

                            return;

                        }


                        answers.push({

                            question:
                                result.questions[i],

                            answer:
                                answer

                        });

                    }


                    submitButton.disabled =
                        true;


                    submitButton.innerText =
                        "Navis is thinking...";


                    document.getElementById(
                        "status"
                    ).innerText =
                        "Re-evaluating with your answers...";


                    const response =
                        await chrome.runtime.sendMessage({

                            type:
                                "ANALYZE_EMAIL",

                            data: {

                                ...emailData,

                                user_answers:
                                    answers

                            }

                        });


                    console.log(
                        "Follow-up analysis:",
                        response
                    );


                    if (
                        !response ||
                        !response.success
                    ) {

                        throw new Error(
                            response?.error ||
                            "Follow-up analysis failed."
                        );

                    }


                    const finalResult =
                        response.result;


                    document.getElementById(
                        "status"
                    ).innerText =
                        "Final analysis complete.";


                    renderFinalResult(
                        finalResult
                    );


                } catch (error) {

                    console.error(
                        "FOLLOW-UP ERROR:",
                        error
                    );


                    document.getElementById(
                        "status"
                    ).innerText =
                        "Error";


                    resultBox.innerHTML += `

                        <p
                            style="
                                color:#dc2626;
                            "
                        >
                            ${error.message}
                        </p>

                    `;

                }

            }
        );

    }

}


/* ============================================================
   FINAL RESULT
   ============================================================ */

function renderFinalResult(result) {

    const resultBox =
        document.getElementById("result");


    let riskClass =
        "risk-low";


    if (
        result.risk_level === "Moderate"
    ) {

        riskClass =
            "risk-moderate";

    }


    if (
        result.risk_level === "High"
    ) {

        riskClass =
            "risk-high";

    }


    resultBox.innerHTML = `

        <div class="final-card">

            <div class="final-label">
                FINAL NAVIS ASSESSMENT
            </div>


            <div class="risk-badge ${riskClass}">

                <span class="risk-dot"></span>

                <h2>
                    ${result.risk_level}
                </h2>

            </div>


            <p class="decision">

                <strong>
                    Decision:
                </strong>

                ${result.result}

            </p>


            <h3>
                Why Navis decided this
            </h3>


            <ul>

                ${(result.reasons || [])
                    .map(reason => `
                        <li>
                            ${reason}
                        </li>
                    `)
                    .join("")}

            </ul>


            <p class="final-message">

                Navis incorporated your answers
                into the final risk assessment.

            </p>

        </div>

    `;

}