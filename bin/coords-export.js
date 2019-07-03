var idoc = app.activeDocument;
var sel = idoc.selection;

for (j = 0; j < sel.length; j++) {
  var ipath = sel[j];
  var itext = idoc.textFrames.add();
  var pp = [];

  var firstPoint;

  for (i = 0; i < ipath.pathPoints.length; i++) {
    var pointStr = '[ ' + ipath.pathPoints[i].anchor[0] + ', ' + ipath.pathPoints[i].anchor[1].toString().replace('-', '') + ' ]';

    // Save the first point because a GeoJSON geometry final point needs
    // to have the final one
    if (i === 0) {
      firstPoint = pointStr;
    }

    pp.push(pointStr);
  }

  pp.push(firstPoint);
  itext.contents = pp.join(',\r');
  itext.left = ipath.left + ipath.width + 2;
  itext.top = ipath.top;

  pp = null;
}
