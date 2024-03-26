function doGet() {
  var doc = DocumentApp.getActiveDocument();
  var body = doc.getBody();
  var data = {};
  var elements = body.getNumChildren();
  for (var i = 0; i < elements-1; i++) {
    var child = body.getChild(i).copy();
    var text = child.getText().trim();
    var elementType = child.getType();
    if (elementType == DocumentApp.ElementType.PARAGRAPH) {
      var paragraphText = text.split(':');
      var key = paragraphText[0].trim();
      var value = paragraphText.slice(1).join(':').trim();
      data[key] = value;
    }
  }
  var jsonString = JSON.stringify(data);
  return ContentService.createTextOutput(jsonString).setMimeType(ContentService.MimeType.JSON);
}
