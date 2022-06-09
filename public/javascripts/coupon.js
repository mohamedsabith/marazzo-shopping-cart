const getDiscountBtn = document.querySelector(".get-discount-btn");
const couponContainer = document.querySelector(".coupon-container");
const closeBtn = document.querySelector(".coupon-container .close");

getDiscountBtn.addEventListener("click", () => {
  couponContainer.classList.add("active");
});

closeBtn.addEventListener("click", () => {
  couponContainer.classList.remove("active");
});
