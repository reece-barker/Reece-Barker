// File#: _3_column-chart
// Usage: codyhouse.co/license
(function () {
  // --default chart demo
  var columnChart1 = document.getElementById('column-chart-1');
  if (columnChart1) {
    new Chart({
      element: columnChart1,
      type: 'column',
      xAxis: {
        line: true,
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        legend: 'Months',
        ticks: true
      },
      yAxis: {
        legend: 'Total',
        labels: true
      },
      datasets: [{
        data: [1, 2, 3, 12, 8, 7, 10, 4, 9, 5, 16, 3]
      }, ],
      column: {
        width: '60%',
        gap: '2px',
        radius: '4px'
      },
      tooltip: {
        enabled: true,
        customHTML: function (index, chartOptions, datasetIndex) {
          return '<span class="color-contrast-medium">' + chartOptions.xAxis.labels[index] + ':</span> $' + chartOptions.datasets[datasetIndex].data[index] + '';
        }
      },
      animate: true
    });
  };

  // --multiset chart demo
  var columnChart2 = document.getElementById('column-chart-2');
  if (columnChart2) {
    new Chart({
      element: columnChart2,
      type: 'column',
      xAxis: {
        line: true,
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        legend: 'Months',
        ticks: true
      },
      yAxis: {
        legend: 'Total',
        labels: true
      },
      datasets: [{
          data: [1, 2, 3, 12, 8, 7, 10, 4, 9, 5, 16, 3]
        },
        {
          data: [4, 8, 10, 12, 15, 11, 7, 3, 5, 2, 12, 6]
        }
      ],
      column: {
        width: '60%',
        gap: '2px',
        radius: '4px'
      },
      tooltip: {
        enabled: true,
        customHTML: function (index, chartOptions, datasetIndex) {
          var html = '<p class="margin-bottom-xxs">Total ' + chartOptions.xAxis.labels[index] + '</p>';
          html = html + '<p class="flex items-center"><span class="height-xxxs width-xxxs radius-50% bg-primary margin-right-xxs"></span>$' + chartOptions.datasets[0].data[index] + '</p>';
          html = html + '<p class="flex items-center"><span class="height-xxxs width-xxxs radius-50% bg-contrast-higher margin-right-xxs"></span>$' + chartOptions.datasets[1].data[index] + '</p>';
          return html;
        },
        position: 'top'
      },
      animate: true
    });
  };

  // --stacked chart demo
  var columnChart3 = document.getElementById('column-chart-3');
  if (columnChart3) {
    new Chart({
      element: columnChart3,
      type: 'column',
      stacked: true,
      xAxis: {
        line: true,
        labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
        legend: 'Months',
        ticks: true
      },
      yAxis: {
        legend: "%'s",
        labels: true
      },
      datasets: [{
          data: [5, 3, 8, 10, 20, 1, 15, 22, 4, 8, 14, 19]
        },
        {
          data: [4, 8, 10, 12, 15, 11, 4, 18, 24, 16, 14, 9]
        }
      ],
      column: {
        width: '60%',
        gap: '2px',
        radius: '4px'
      },
      tooltip: {
        enabled: true,
        customHTML: function (index, chartOptions, datasetIndex) {
          var html = '<p class="margin-bottom-xxs">+% and -% in ' + chartOptions.xAxis.labels[index] + '</p>';
          html = html + '<p class="flex items-center"><span class="height-xxxs width-xxxs radius-50% bg-primary margin-right-xxs"></span>' + chartOptions.datasets[0].data[index] + '%</p>';
          html = html + '<p class="flex items-center"><span class="height-xxxs width-xxxs radius-50% bg-contrast-higher margin-right-xxs"></span>' + chartOptions.datasets[1].data[index] + '%</p>';
          return html;
        },
        position: 'top'
      },
      animate: true
    });
  };

  // --negative-values chart demo
  var columnChart4 = document.getElementById('column-chart-4');
  if (columnChart4) {
    new Chart({
      element: columnChart4,
      type: 'column',
      xAxis: {
        line: true,
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        legend: 'Months',
        ticks: true
      },
      yAxis: {
        legend: 'Total',
        labels: true
      },
      datasets: [{
        data: [1, 4, 8, 5, 3, -2, -5, -7, 4, 9, 5, 10, 3]
      }, ],
      column: {
        width: '60%',
        gap: '2px',
        radius: '4px'
      },
      tooltip: {
        enabled: true,
        customHTML: function (index, chartOptions, datasetIndex) {
          return '<span class="color-contrast-medium">' + chartOptions.xAxis.labels[index] + ':</span> ' + chartOptions.datasets[datasetIndex].data[index] + '$';
        }
      },
      animate: true
    });
  };
}());