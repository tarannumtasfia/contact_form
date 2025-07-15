const form = document.querySelector(".contact-form");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // const recaptchaToken = grecaptcha.getResponse();
  // console.log("reCAPTCHA token:", recaptchaToken);

  // if (!recaptchaToken) {
  //   alert("Please complete the reCAPTCHA.");
  //   return;
  // }

  const formData = {
    name: document.getElementById("name").value.trim(),
    email: document.getElementById("email").value.trim(),
    subject: document.getElementById("subject").value.trim(),
    message: document.getElementById("message").value.trim(),
    // recaptchaToken,
  };

  try {
    const res = await fetch("/api/send-email", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    let result;
    try {
      result = await res.json();
    } catch {
      alert("Server error: response was not JSON.");
      return;
    }

    if (res.ok) {
      alert("Message sent successfully!");
      form.reset();
      // grecaptcha.reset();
    } else {
      console.error("Error from server:", result.error);
      const errorMessage =
        typeof result.error === "string"
          ? result.error
          : JSON.stringify(result.error, null, 2) || "Something went wrong.";
      alert("Error: " + errorMessage);
    }
  } catch (error) {
    console.error("Fetch error:", error);
    alert("Failed to send request. Please try again later.");
  }
});
