const form = document.querySelector(".contact-form");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const recaptchaToken = grecaptcha.getResponse();
  console.log("reCAPTCHA token:", recaptchaToken);

  if (!recaptchaToken) {
    alert("Please complete the reCAPTCHA.");
    return;
  }

  const formData = {
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    message: document.getElementById("message").value,
    recaptchaToken,
  };

  console.log("Sending form data:", formData);

  const res = await fetch("/send-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  });

  const result = await res.json();
  console.log("Server response:", result);

  if (res.ok) {
    alert("Message sent successfully!");
    form.reset();
    grecaptcha.reset();
  } else {
    alert(result.error || "Something went wrong.");
  }
});
