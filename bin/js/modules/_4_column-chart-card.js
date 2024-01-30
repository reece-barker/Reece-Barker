// File#: _4_column-chart-card
// Usage: codyhouse.co/license
(function() {
  var columnChartCard = document.getElementById('column-chart-card');
  if(columnChartCard) {
    new Chart({
      element: columnChartCard,
      type: 'column',
      xAxis: {
        line: true,
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        ticks: true
      },
      yAxis: {
        labels: true
      },
      datasets: [
        {data: [1, 2, 3, 12, 8, 7, 10, 4, 9, 5, 16, 3]},
        {data: [4, 8, 10, 12, 15, 11, 7, 3, 5, 2, 12, 6]}
      ],
      column: {
        width: '60%',
        gap: '2px',
        radius: '4px'
      },
      tooltip: {
        enabled: true,
        customHTML: function(index, chartOptions, datasetIndex) {
          var html = '<p class="margin-bottom-xxs">Total '+chartOptions.xAxis.labels[index] + '</p>';
          html = html + '<p class="flex items-center"><span class="height-xxxs width-xxxs radius-50% bg-primary margin-right-xxs"></span>$'+chartOptions.datasets[0].data[index]+'</p>';
          html = html + '<p class="flex items-center"><span class="height-xxxs width-xxxs radius-50% bg-contrast-higher margin-right-xxs"></span>$'+chartOptions.datasets[1].data[index]+'</p>';
          return html;
        },
        position: 'top'
      },
      animate: true
    });
  };
}());