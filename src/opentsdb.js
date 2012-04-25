cubism_contextPrototype.opentsdb = function(host) {
  if (!arguments.length) host = "";
  var source = {},
      context = this;

  source.metric = function(expression) {
    return context.metric(function(start, stop, step, callback) {
      d3.text(host + "/q?ascii"
          + "&m=" + encodeURIComponent(expression)
          + "&start=" + encodeURIComponent(cubism_opentsdbFormatDate(start))
          + "&end=" + encodeURIComponent(cubism_opentsdbFormatDate(stop)), function(text) {
        if (!text) return callback(new Error("unable to load data"));
        callback(null, cubism_opentsdbParse(text, start, step));
      });
    }, expression += "");
  };

  source.find = function(pattern, callback) {
    d3.json(host + "/suggest?type=metrics"
        + "&q=" + encodeURIComponent(pattern), function(result) {
      if (!result) return callback(new Error("unable to find metrics"));
      callback(null, result);
    });
  };

  source.toString = function() {
    return host;
  };

  return source;
};

var cubism_opentsdbFormatDate = d3.time.format.utc("%Y/%m/%d-%X");

var cubism_opentsdbParse = function(text, start, step) {
  var results = [],
      lines = text.split(/\n/);

  var a, b, c,
      line,
      metric,
      timestamp,
      value,
      date;

  for (var i = 0; i < lines.length; ++i){
    line = lines[i];

    a = line.indexOf(' ');
    b = line.indexOf(' ', a + 1);
    c = line.indexOf(' ', b + 1);
    metric = line.substring(0, a);
    timestamp = line.substring(a+1, b);
    value = line.substring(b+1, c);
    date = new Date((+timestamp) * 1000);

    if (start - date > step) continue;
    results.push(+value);
  }
  return results;
};
