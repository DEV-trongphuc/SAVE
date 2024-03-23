function doGet() {
  let spreadsheetId = ""; // ID của bảng tính Google
  let sheet = SpreadsheetApp.openById(spreadsheetId).getActiveSheet();
  let data = sheet.getDataRange().getValues();
  let headers = data[0];
  let dataArray = [];

  for (let i = 1; i < data.length; i++) {
    let row = data[i];
    let obj = {};
    for (let j = 0; j < headers.length; j++) {
      obj[headers[j].toLowerCase().replace(/\s+/g, "_")] = row[j];
    }
    dataArray.push(obj);
  }

  return ContentService.createTextOutput(JSON.stringify(dataArray)).setMimeType(
    ContentService.MimeType.JSON
  );
}
