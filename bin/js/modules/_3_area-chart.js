// File#: _3_area-chart
// Usage: codyhouse.co/license
(function() {
  // --default chart demo
  var areaChart1 = document.getElementById('area-chart-1');
  if(areaChart1) {
    new Chart({
      element: areaChart1,
      type: 'area',
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

  // --smooth chart demo
  var areaChart2 = document.getElementById('area-chart-2');
  if(areaChart2) {
    new Chart({
      element: areaChart2,
      type: 'area',
      smooth: true,
      xAxis : {
        line: true,
        range: [0, 10],
        step: 2,
        labels: true
      },
      yAxis: {
        labels: true
      },
      datasets: [
        {
          data: [[0, 1], [1, 2], [2, -3], [3, 12], [4, 8], [5, 7], [6, 10], [7, 4], [8, 9], [9, 5], [10, 16]]
        }
      ],
      tooltip: {
        enabled: true,
        position: 'top',
        customHTML: function(index, chartOptions, datasetIndex) {
          // show only Y value (chartOptions.datasets[datasetIndex].data[index][1])
          return 'Value: <span class="color-primary">'+chartOptions.datasets[datasetIndex].data[index][1]+'</span>';
        }
      },
      animate: true
    });
  }

  // --negative-values chart demo
  var areaChart3 = document.getElementById('area-chart-3');
  if(areaChart3) {
    new Chart({
      element: areaChart3,
      type: 'area',
      fillOrigin: true,
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
      datasets: [
        {
          data: [10, 7, 4, -1, -5, -7, -6, -4, -1, 3, 5, 2]
        }
      ],
      tooltip: {
        enabled: true,
        customHTML: function(index, chartOptions, datasetIndex) {
          return '<span class="color-contrast-medium">'+chartOptions.xAxis.labels[index] + ':</span> '+chartOptions.datasets[datasetIndex].data[index]+'$';
        }
      },
      animate: true
    });
  }

  // --multiset chart demo
  var multiSet = document.getElementById('multi-set-chart');
  if(multiSet) {
    new Chart({
      element: multiSet,
      type: 'area',
      xAxis: {
        line: true,
        ticks: true,
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        legend: 'Months'
      },
      yAxis: {
        legend: 'Total',
        labels: true
      },
      datasets: [
        {data: [5, 7, 11, 13, 18, 16, 17, 13, 16, 8, 15, 8]},
        {data: [1, 2, 3, 6, 4, 11, 9, 10, 9, 4, 7, 3]}
      ],
      tooltip: {
        enabled: true,
        position: 'top',
        customHTML: function(index, chartOptions, datasetIndex) {
          var html = '<p class="margin-bottom-xxs">Total '+chartOptions.xAxis.labels[index] + '</p>';
          html = html + '<p class="flex items-center"><span class="height-xxxs width-xxxs radius-50% bg-primary margin-right-xxs"></span>$'+chartOptions.datasets[0].data[index]+'</p>';
          html = html + '<p class="flex items-center"><span class="height-xxxs width-xxxs radius-50% bg-accent margin-right-xxs"></span>$'+chartOptions.datasets[1].data[index]+'</p>';
          return html;
        }
      },
      animate: true
    });
  }

  // --external-data-value chart demo
  var externalData = document.getElementById('ext-area-chart');
  if(externalData) {
    new Chart({
      element: externalData,
      type: 'area',
      xAxis: {
        line: true,
        ticks: true,
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        legend: 'Months'
      },
      yAxis: {
        legend: 'Total',
        labels: true
      },
      datasets: [
        {data: [1, 2, 3, 6, 4, 11, 9, 10, 9, 4, 7, 3]},
      ],
      animate: true,
      externalData : {
        customXHTML: function(index, chartOptions, datasetIndex) {
          return ' '+chartOptions.xAxis.labels[index];
        }
      }
    });
  }
}());