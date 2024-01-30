// File#: _4_area-chart-card
// Usage: codyhouse.co/license
(function() {
  var areaChartCard = document.getElementById('area-chart-card');
  if(areaChartCard) {
    new Chart({
      element: areaChartCard,
      type: 'area',
      xAxis: {
        line: true,
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        ticks: true
      },
      yAxis: {
        labels: true
      },
      datasets: [
        {
          data: [1, 2, 3, 12, 8, 7, 10, 4, 9, 5, 16, 3]
        }
      ],
      tooltip: {
        enabled: true,
        customHTML: function(index, chartOptions, datasetIndex) {
          return '<span class="color-contrast-medium">'+chartOptions.xAxis.labels[index] + ':</span> $'+chartOptions.datasets[datasetIndex].data[index]+'';
        }
      },
      animate: true
    });
  };
}());