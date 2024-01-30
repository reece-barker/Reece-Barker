// File#: _4_stats-card
// Usage: codyhouse.co/license
(function () {
  var statsCard = document.getElementById('stats-card-chart-1');
  if (statsCard) {
    new Chart({
      element: statsCard,
      type: 'area',
      xAxis: {
        labels: false,
        guides: false
      },
      yAxis: {
        labels: false,
        range: [0, 16], // 16 is the max value in the chart data
        step: 1
      },
      datasets: [{
        data: [1, 2, 3, 12, 8, 7, 10, 4, 9, 5, 16, 3]
      }],
      tooltip: {
        enabled: true,
      },
      padding: 6,
      animate: true
    });
  };

  var statsCard = document.getElementById('stats-card-chart-2');
  if (statsCard) {
    new Chart({
      element: statsCard,
      type: 'area',
      xAxis: {
        labels: false,
        guides: false
      },
      yAxis: {
        labels: false,
        range: [0, 21], // 16 is the max value in the chart data
        step: 1
      },
      datasets: [{
        data: [7, 10, 2, 6, 2, 2, 12, 14, 12, 16, 15, 21]
      }],
      tooltip: {
        enabled: true,
      },
      padding: 6,
      animate: true
    });
  };

  var statsCard = document.getElementById('stats-card-chart-3');
  if (statsCard) {
    new Chart({
      element: statsCard,
      type: 'area',
      xAxis: {
        labels: false,
        guides: false
      },
      yAxis: {
        labels: false,
        range: [0, 23], // 16 is the max value in the chart data
        step: 1
      },
      datasets: [{
        data: [2, 10, 23, 15, 12, 19, 20, 15, 12, 9, 11, 20]
      }],
      tooltip: {
        enabled: true,
      },
      padding: 6,
      animate: true
    });
  };

  var statsCard = document.getElementById('stats-card-chart-4');
  if (statsCard) {
    new Chart({
      element: statsCard,
      type: 'area',
      xAxis: {
        labels: false,
        guides: false
      },
      yAxis: {
        labels: false,
        range: [0, 25], // 16 is the max value in the chart data
        step: 1
      },
      datasets: [{
        data: [12, 5, 10, 15, 16, 20, 19, 22, 18, 20, 21, 25]
      }],
      tooltip: {
        enabled: true,
      },
      padding: 6,
      animate: true
    });
  };
}());