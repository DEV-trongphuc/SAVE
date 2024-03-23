function doGet() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var value = sheet.getRange('F2').getValue(); // Ô mà các bạn nhập công thức
      return ContentService.createTextOutput(JSON.stringify({"data":value, "error": false})).setMimeType(ContentService.MimeType.JSON)
}
