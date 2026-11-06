function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function formatBookingMessage(data) {
  const timestamp = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
  return `🔥 <b>ĐẶT BÀN MỚI - RƠM NƯỚNG</b> 🔥
━━━━━━━━━━━━━━━━━━━━
👤 <b>Khách hàng:</b> ${escapeHtml(data.name)}
📞 <b>Số điện thoại:</b> <a href="tel:${escapeHtml(data.phone)}">${escapeHtml(data.phone)}</a>
🏢 <b>Chi nhánh:</b> ${escapeHtml(data.branch)}
📅 <b>Ngày dùng bữa:</b> ${escapeHtml(data.date)}
⏰ <b>Khung giờ:</b> ${escapeHtml(data.time)}
👥 <b>Số lượng:</b> ${escapeHtml(data.guests)}
🎉 <b>Mục đích:</b> ${escapeHtml(data.purpose)}
📝 <b>Ghi chú:</b> ${escapeHtml(data.notes || 'Không có')}
━━━━━━━━━━━━━━━━━━━━
⏰ <i>Thời gian gửi: ${timestamp}</i>
👉 <i>Nhân viên vui lòng liên hệ xác nhận bàn cho khách trong 5 phút!</i>`;
}

async function sendTelegram(text) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.warn('Thiếu TELEGRAM_BOT_TOKEN hoặc TELEGRAM_CHAT_ID trong Vercel Environment Variables');
    return { ok: false, warning: 'Thiếu cấu hình' };
  }

  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: 'HTML'
    })
  });
  return await response.json();
}

module.exports = async (req, res) => {
  // Chỉ chấp nhận POST request
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    const data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const { name, phone } = data;

    if (!name || !phone) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp họ tên và số điện thoại.' });
    }

    // Gửi thông báo Telegram
    const teleResult = await sendTelegram(formatBookingMessage(data));

    // Gửi Google Sheets nếu có cấu hình
    if (process.env.GOOGLE_SHEET_WEBHOOK_URL) {
      try {
        await fetch(process.env.GOOGLE_SHEET_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
      } catch (err) {
        console.error('Lỗi gửi Webhook Google Sheets:', err.message);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Đặt bàn thành công!',
      telegramSent: teleResult?.ok || false
    });
  } catch (error) {
    console.error('Vercel API Booking Error:', error);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ khi xử lý đặt bàn.' });
  }
};

