function doGet() {
  var doc = DocumentApp.getActiveDocument();
  var body = doc.getBody();
  var data = {};
  var elements = body.getNumChildren();
  for (var i = 0; i < elements; i++) {
    var child = body.getChild(i).copy();
    var text = child.getText().trim();
    var elementType = child.getType();
    if (elementType == DocumentApp.ElementType.PARAGRAPH) {
      var firstColonIndex = text.indexOf(':');
      if (firstColonIndex !== -1) {
        var key = text.slice(0, firstColonIndex).trim();
        var value = text.slice(firstColonIndex + 1).trim();
        data[key] = value;
      }
    }
  }
  var jsonString = JSON.stringify(data);
  return ContentService.createTextOutput(jsonString).setMimeType(ContentService.MimeType.JSON);
}
