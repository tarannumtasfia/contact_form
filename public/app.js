const contactform = document.querySelector(".contact-form");
const name = document.getElementById("name");
const email = document.getElementById("email");
const subject = document.getElementById("subject");
const message = document.getElementById("message");

contactform.addEventListener("submit", async (e) => {
  e.preventDefault();

  const recaptchaToken = grecaptcha.getResponse();
  
  if (!recaptchaToken) {
    alert("Please complete the reCAPTCHA.");
    return;
  }
console.log('reCAPTCHA token:', recaptchaToken);
  const formData = {
    name: name.value.trim(),
    email: email.value.trim(),
    subject: subject.value.trim(),
    message: message.value.trim(),
    recaptchaToken: recaptchaToken,
  };

  console.log("Sending form data:", formData);

  try {
    const response = await fetch("/send-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    const result = await response.json();

    console.log("Server response:", result);

    if (response.ok) {
      alert(result.message);
      contactform.reset();
      grecaptcha.reset(); // Reset reCAPTCHA widget after successful submission
    } else {
      alert(result.error || "An error occurred while sending the email.");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("An error occurred while sending the email.");
  }
});
