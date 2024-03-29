// Hàm check sinh nhật hôm nay trên Google sheets: 

=IF(AND(DAY(D2)=DAY(TODAY()),MONTH(D2)=MONTH(TODAY())),true,"")

// Hàm trên appscript ngay chỗ htmlBody các bạn thay cái template email trên stripo.email của mình vô nhe 
// Mấy cái item[số] các bạn sửa lại cho phù hợp với trang tính nhe
function doGet() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet(); //  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Tên tab sheet"); Nếu trang tính bạn có nhiều tab sheet
  const range = sheet.getDataRange();
  const values = range.getValues()
  values.forEach((item)=> {
   if(item[4]) {
    MailApp.sendEmail({
      to: item[1],
      subject: "HAPPY BIRTHDAY",
      htmlBody: ``
    })
   }
  })
}
