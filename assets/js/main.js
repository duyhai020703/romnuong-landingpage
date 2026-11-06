/**
 * RƠM NƯỚNG - MÓN NƯỚNG VIỆT NAM
 * Interactive Scripts (romnuong style)
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Mobile Menu Drawer
  const mobileBtn = document.querySelector('.mobile-menu-btn');
  const drawer = document.querySelector('.mobile-nav-drawer');
  const backdrop = document.querySelector('.mobile-nav-backdrop');
  const closeDrawer = document.querySelector('.close-drawer-btn');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  const toggleDrawer = (open) => {
    if (open) {
      drawer.classList.add('active');
      backdrop.classList.add('active');
      document.body.style.overflow = 'hidden';
    } else {
      drawer.classList.remove('active');
      backdrop.classList.remove('active');
      document.body.style.overflow = '';
    }
  };

  if (mobileBtn) mobileBtn.addEventListener('click', () => toggleDrawer(true));
  if (closeDrawer) closeDrawer.addEventListener('click', () => toggleDrawer(false));
  if (backdrop) backdrop.addEventListener('click', () => toggleDrawer(false));
  mobileLinks.forEach((link) => link.addEventListener('click', () => toggleDrawer(false)));

  // 2. Banner Carousel (Clean Slider - NO BLUE OVERLAY)
  const slides = document.querySelectorAll('.banner-slide');
  const bullets = document.querySelectorAll('.banner-bullet');
  const prevBtn = document.querySelector('.banner-arrow.prev');
  const nextBtn = document.querySelector('.banner-arrow.next');
  let currentSlide = 0;
  let bannerTimer = null;

  const setSlide = (idx) => {
    slides.forEach((s) => s.classList.remove('active'));
    bullets.forEach((b) => b.classList.remove('active'));

    currentSlide = (idx + slides.length) % slides.length;
    slides[currentSlide].classList.add('active');
    if (bullets[currentSlide]) {
      bullets[currentSlide].classList.add('active');
    }
  };

  const nextSlide = () => setSlide(currentSlide + 1);
  const prevSlide = () => setSlide(currentSlide - 1);

  if (slides.length > 0) {
    const startTimer = () => {
      stopTimer();
      bannerTimer = setInterval(nextSlide, 5000);
    };

    const stopTimer = () => {
      if (bannerTimer) clearInterval(bannerTimer);
    };

    if (nextBtn) nextBtn.addEventListener('click', () => { nextSlide(); startTimer(); });
    if (prevBtn) prevBtn.addEventListener('click', () => { prevSlide(); startTimer(); });

    bullets.forEach((bullet, idx) => {
      bullet.addEventListener('click', () => {
        setSlide(idx);
        startTimer();
      });
    });

    const carouselSec = document.querySelector('.banner-carousel-section');
    if (carouselSec) {
      carouselSec.addEventListener('mouseenter', stopTimer);
      carouselSec.addEventListener('mouseleave', startTimer);

      // Touch swipe support for mobile
      let touchStartX = 0;
      let touchEndX = 0;
      carouselSec.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        stopTimer();
      }, { passive: true });

      carouselSec.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        if (touchStartX - touchEndX > 45) {
          nextSlide();
        } else if (touchEndX - touchStartX > 45) {
          prevSlide();
        }
        startTimer();
      }, { passive: true });
    }

    startTimer();
  }

  // 3. Menu Category Filter Tabs
  const tabs = document.querySelectorAll('.tab-pill');
  const dishCards = document.querySelectorAll('.menu-dish-card');

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');

      const filter = tab.getAttribute('data-filter');

      dishCards.forEach((card) => {
        const cat = card.getAttribute('data-category');
        if (filter === 'all' || cat === filter) {
          card.style.display = 'flex';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 40);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(12px)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 240);
        }
      });
    });
  });

  // 4. Guest Counter
  const minusBtn = document.getElementById('minusGuest');
  const plusBtn = document.getElementById('plusGuest');
  const guestDisplay = document.getElementById('guestDisplay');
  const hiddenInput = document.getElementById('hiddenGuests');

  if (minusBtn && plusBtn && guestDisplay) {
    minusBtn.addEventListener('click', () => {
      let val = parseInt(guestDisplay.innerText, 10);
      if (val > 1) {
        val -= 1;
        guestDisplay.innerText = `${val} Khách`;
        if (hiddenInput) hiddenInput.value = val;
      }
    });

    plusBtn.addEventListener('click', () => {
      let val = parseInt(guestDisplay.innerText, 10);
      if (val < 100) {
        val += 1;
        guestDisplay.innerText = `${val} Khách`;
        if (hiddenInput) hiddenInput.value = val;
      }
    });
  }

  // 5. Booking Form Submission
  const bookingForm = document.getElementById('bookingTableForm');
  const successModal = document.getElementById('bookingConfirmedModal');
  const closeSuccessBtn = document.getElementById('closeConfirmModalBtn');
  const summaryBox = document.getElementById('bookingSummaryContent');
  const submitBtn = bookingForm?.querySelector('button[type="submit"]');

  if (bookingForm) {
    bookingForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = document.getElementById('clientName')?.value.trim() || 'Quý khách';
      const phone = document.getElementById('clientPhone')?.value.trim() || '';
      const branch = 'Rơm Nướng: 74 Lương Thế Vinh (Chánh Môn A), Tây Ninh';
      const date = document.getElementById('bookDate')?.value || 'Hôm nay';
      const time = document.getElementById('bookTime')?.value || '18:00';
      const guests = guestDisplay?.innerText || '4 Khách';
      const purpose = document.querySelector('input[name="eventPurpose"]:checked')?.value || 'Gia đình';
      const notes = document.getElementById('specialNotes')?.value.trim() || 'Không có';

      // Validate số điện thoại Việt Nam (10 số)
      const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
      if (!phoneRegex.test(phone.replace(/\s+/g, ''))) {
        alert('Vui lòng nhập đúng định dạng số điện thoại Việt Nam (ví dụ: 0908805878)');
        document.getElementById('clientPhone')?.focus();
        return;
      }

      // Trạng thái Loading trên nút bấm
      const originalBtnText = submitBtn ? submitBtn.innerHTML : 'XÁC NHẬN ĐẶT BÀN';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> ĐANG GỬI THÔNG TIN...';
      }

      try {
        const response = await fetch('/api/booking', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name,
            phone,
            branch,
            date,
            time,
            guests,
            purpose,
            notes
          })
        });

        const result = await response.json();

        if (response.ok && result.success) {
          if (summaryBox) {
            summaryBox.innerHTML = `
              <strong>Người đặt:</strong> ${name} &bull; ${phone}<br/>
              <strong>Thời gian:</strong> ${time} - Ngày ${date}<br/>
              <strong>Số khách:</strong> ${guests} &bull; <strong>Mục đích:</strong> ${purpose}<br/>
              <strong>Yêu cầu:</strong> ${notes}
            `;
          }

          if (successModal) {
            successModal.classList.add('active');
            document.body.style.overflow = 'hidden';
          }

          bookingForm.reset();
          if (guestDisplay) guestDisplay.innerText = '4 Khách';
          if (hiddenInput) hiddenInput.value = '4';
          if (dateInput) {
            const today = new Date().toISOString().split('T')[0];
            dateInput.value = today;
            dateInput.min = today;
          }
        } else {
          alert(result.message || 'Có lỗi xảy ra khi gửi yêu cầu. Quý khách vui lòng gọi Hotline 0908805878 để được giữ bàn ngay!');
        }
      } catch (err) {
        console.error('Lỗi kết nối đặt bàn:', err);
        alert('Không thể kết nối máy chủ đặt bàn. Quý khách vui lòng liên hệ trực tiếp Hotline 0908805878 để đặt bàn nhanh nhất!');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnText;
        }
      }
    });
  }

  if (closeSuccessBtn && successModal) {
    closeSuccessBtn.addEventListener('click', () => {
      successModal.classList.remove('active');
      document.body.style.overflow = '';
    });
  }

  // Set default booking date to today
  const dateInput = document.getElementById('bookDate');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
    dateInput.min = today;
  }

  // 6. Scroll To Top & Floating Actions
  const topAction = document.querySelector('.action-top');
  window.addEventListener('scroll', () => {
    if (topAction) {
      if (window.scrollY > 350) {
        topAction.classList.add('visible');
      } else {
        topAction.classList.remove('visible');
      }
    }
  });

  if (topAction) {
    topAction.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
});

// Global Helper Functions
function selectDishForNote(dishName) {
  const notesField = document.getElementById('specialNotes');
  if (notesField) {
    if (!notesField.value.includes(dishName)) {
      notesField.value = notesField.value
        ? `${notesField.value}, Món chọn: ${dishName}`
        : `Món chọn trước: ${dishName}`;
    }
  }
  const bookingSec = document.getElementById('dat-ban');
  if (bookingSec) {
    bookingSec.scrollIntoView({ behavior: 'smooth' });
  }
}

function viewPhotoInModal(imgSrc, captionText) {
  const modal = document.getElementById('photoPreviewModal');
  const imgEl = document.getElementById('fullPreviewImage');
  const captionEl = document.getElementById('fullPreviewCaption');
  const closeBtn = document.getElementById('closePhotoModalBtn');

  if (modal && imgEl) {
    imgEl.src = imgSrc;
    if (captionEl) captionEl.innerText = captionText || '';
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    const closeModal = () => {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    };

    if (closeBtn) closeBtn.onclick = closeModal;
    modal.onclick = (e) => {
      if (e.target === modal) closeModal();
    };
  }
}
