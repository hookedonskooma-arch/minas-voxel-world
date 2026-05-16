(() => {
  const chibi = document.querySelector("#chibi");
  document.querySelectorAll("[data-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll("[data-tab]").forEach((item) => item.classList.remove("is-active"));
      button.classList.add("is-active");
    });
  });

  document.querySelectorAll("[data-color]").forEach((swatch) => {
    swatch.addEventListener("click", () => {
      if (!chibi) return;
      const part = swatch.dataset.part;
      chibi.style.setProperty(part === "hair" ? "--hair" : "--outfit", swatch.dataset.color);
    });
  });

  let selectedPiece = "🌳";
  document.querySelectorAll("[data-place]").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll("[data-place]").forEach((item) => item.classList.remove("is-active"));
      button.classList.add("is-active");
      selectedPiece = button.dataset.place || selectedPiece;
    });
  });

  document.querySelectorAll("#worldGrid .tile").forEach((tile) => {
    tile.addEventListener("click", () => {
      tile.textContent = selectedPiece;
      tile.style.setProperty("--tile", "color-mix(in oklch, var(--mint), white 32%)");
    });
  });

  const invite = document.querySelector("#inviteBtn");
  if (invite) {
    invite.addEventListener("click", () => {
      invite.textContent = "Invite sent";
      invite.disabled = true;
    });
  }
})();
