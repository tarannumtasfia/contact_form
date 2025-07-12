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
    subject: document.getElementById("subject").value,
    message: document.getElementById("message").value,
    recaptchaToken,
  };

  

const res = await fetch("/api/send-email", {
  method: "POST",
  headers: {
    "Accept": "application/json",
    "Content-Type": "application/json"
  },
  body: JSON.stringify(formData),
});

let result;
try {
  result = await res.json();
} catch (e) {
  // If response is not JSON, show a generic error
  alert("Server error: response was not JSON.");
  return;
}

if (res.ok) {
  alert("Message sent successfully!");
  form.reset();
  grecaptcha.reset();
} else {
  alert(result.error ? JSON.stringify(result.error) : "Something went wrong.");
}
});
