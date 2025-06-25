
// Carga y visualización de datos sobre cine de ciencia ficción (1950–2020)

// Utilidad para cargar datos desde data.json
document.addEventListener('DOMContentLoaded', () => {
  fetch('data.json')
    .then(response => response.json())
    .then(data => {
      renderTimelineChart(data);
      renderBarChart(data);
      renderCountryChart(data);
      renderTopMoviesTable(data);
      renderDurationBubbleChart(data);
    });
});

// 1. Línea de tiempo: películas por década
function renderTimelineChart(data) {
  const ctx = document.createElement('canvas');
  document.getElementById('timeline-chart').appendChild(ctx);
  const decades = data.timeline.map(d => d.decade);
  const counts = data.timeline.map(d => d.count);
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: decades,
      datasets: [{
        label: 'Películas por década',
        data: counts,
        borderColor: '#2e3a59',
        backgroundColor: 'rgba(46,58,89,0.08)',
        tension: 0.3,
        pointRadius: 5,
        pointBackgroundColor: '#2e3a59',
        fill: true
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: { enabled: true }
      },
      scales: {
        x: { title: { display: true, text: 'Década' } },
        y: { title: { display: true, text: 'Cantidad de películas' }, beginAtZero: true }
      }
    }
  });
}

// 2. Dot plot comparativo: cantidad de películas vs. cantidad de premiadas por década
function renderBarChart(data) {
  const ctx = document.createElement('canvas');
  document.getElementById('bar-chart').appendChild(ctx);
  const decades = data.timeline.map(d => d.decade);
  const total = data.timeline.map(d => d.count);
  const awarded = data.timeline.map(d => d.awarded);

  const connectDots = {
    id: 'connectDots',
    afterDatasetsDraw(chart) {
      const {ctx, chartArea, scales} = chart;
      const yAxis = scales.y;
      const xAxis = scales.x;
      ctx.save();
      chart.data.labels.forEach((label, i) => {
        const x1 = xAxis.getPixelForValue(total[i]);
        const x2 = xAxis.getPixelForValue(awarded[i]);
        const y = yAxis.getPixelForValue(label);
        ctx.beginPath();
        ctx.moveTo(x1, y);
        ctx.lineTo(x2, y);
        ctx.strokeStyle = '#F9E166';
        ctx.lineWidth = 4;
        ctx.globalAlpha = 0.7;
        ctx.stroke();
        ctx.globalAlpha = 1;
      });
      ctx.restore();
    }
  };

  new Chart(ctx, {
    type: 'scatter',
    data: {
      labels: decades,
      datasets: [
        {
          label: 'Total de películas',
          data: total.map((d, i) => ({x: d, y: decades[i]})),
          backgroundColor: '#61afef',
          pointRadius: 10,
          pointHoverRadius: 14,
          showLine: false
        },
        {
          label: 'Películas premiadas',
          data: awarded.map((a, i) => ({x: a, y: decades[i]})),
          backgroundColor: '#d24e7a',
          pointRadius: 10,
          pointHoverRadius: 14,
          showLine: false
        }
      ]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      plugins: {
        legend: { position: 'top' },
        tooltip: {
          callbacks: {
            label: function(context) {
              if (context.dataset.label.includes('Total')) {
                return `Total: ${data.timeline[context.dataIndex].count}`;
              } else {
                return `Premiadas: ${data.timeline[context.dataIndex].awarded}`;
              }
            }
          }
        }
      },
      scales: {
        x: {
          title: { display: true, text: 'Cantidad de películas' },
          min: 0,
          max: Math.max(...total) + 10,
          grid: { color: '#23294622' }
        },
        y: {
          type: 'category',
          title: { display: false },
          grid: { color: '#23294611' },
          ticks: { font: { size: 18 } }
        }
      }
    },
    plugins: [connectDots]
  });
}

// 3. Donut chart: distribución de subgéneros de ciencia ficción
function renderSubgenreChart(data) {
  const ctx = document.createElement('canvas');
  document.getElementById('subgenre-chart').appendChild(ctx);
  const labels = data.subgenres.map(s => s.label);
  const counts = data.subgenres.map(s => s.count);
  const colors = [
    '#61afef', '#F9E166', '#d24e7a', '#4e7ad2', '#e67e22', '#b0b8c1', '#232946'
  ];
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: counts,
        backgroundColor: colors,
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom' },
        tooltip: { enabled: true }
      },
      cutout: '65%'
    }
  });
}

// 4. Barras horizontales: país de origen con banderas emoji
function renderCountryChart(data) {
  const ctx = document.createElement('canvas');
  document.getElementById('country-chart').appendChild(ctx);
  const labels = data.countries.map(c => `${c.country} ${c.label}`);
  const counts = data.countries.map(c => c.count);
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Películas',
        data: counts,
        backgroundColor: '#61afef',
        borderRadius: 12,
        maxBarThickness: 38
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: { enabled: true }
      },
      scales: {
        x: {
          title: { display: true, text: 'Cantidad de películas' },
          beginAtZero: true,
          grid: { color: '#23294622' }
        },
        y: {
          title: { display: false },
          grid: { color: '#23294611' },
          ticks: { font: { size: 18 } }
        }
      }
    }
  });
}

// 5. Top 10 películas mejor puntuadas por década (tabla con barras)
function renderTopMoviesTable(data) {
  const decades = Object.keys(data.top_movies_by_decade);
  let currentDecade = decades[0];

  const controls = document.getElementById('top-movies-controls');
  const tableDiv = document.getElementById('top-movies-table');

  function renderControls() {
    controls.innerHTML = decades.map(d => `<button class="top-movie-btn" data-decade="${d}">${d}</button>`).join(' ');
    Array.from(controls.querySelectorAll('button')).forEach(btn => {
      btn.onclick = () => {
        currentDecade = btn.dataset.decade;
        renderTable();
        updateActive();
      };
    });
    updateActive();
  }
  function updateActive() {
    Array.from(controls.querySelectorAll('button')).forEach(btn => {
      btn.classList.toggle('active', btn.dataset.decade === currentDecade);
    });
  }

  function renderTable() {
    const movies = data.top_movies_by_decade[currentDecade];
    const maxScore = Math.max(...movies.map(m => m.score));
    tableDiv.innerHTML = `
      <table class="top-movies-table" style="width:100%; border-collapse:collapse;">
        <thead>
          <tr>
            <th style="text-align:left; padding:8px;">#</th>
            <th style="text-align:left; padding:8px;">Película</th>
            <th style="text-align:left; padding:8px;">Año</th>
            <th style="text-align:left; padding:8px;">Puntaje</th>
            <th style="text-align:left; padding:8px;"> </th>
          </tr>
        </thead>
        <tbody>
          ${movies.map((m, i) => `
            <tr>
              <td style="padding:8px; font-weight:bold;">${i+1}.</td>
              <td style="padding:8px; font-weight:600;"><a href="${m.link}" target="_blank" rel="noopener noreferrer" style="color:#61afef; text-decoration:underline;">${m.title}</a></td>
              <td style="padding:8px;">${m.year}</td>
              <td style="padding:8px; font-weight:bold; color:#d24e7a;">${m.score.toFixed(1)}</td>
              <td style="padding:8px; width:40%;">
                <div style="background:#F9E16622; border-radius:8px; height:18px; position:relative;">
                  <div style="background:#4e7ad2; height:18px; border-radius:8px; width:${(m.score/maxScore*100).toFixed(1)}%; transition:width 0.4s;"></div>
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  renderControls();
  renderTable();
}

// Bubble chart: duración vs. score de las mejores películas
function renderDurationBubbleChart(data) {
  const container = document.getElementById('duration-bubble-chart');
  container.innerHTML = '';

  // Filtro de década
  const decades = Object.keys(data.top_movies_by_decade);
  let currentDecade = decades[0];
  const controls = document.createElement('div');
  controls.style.textAlign = 'center';
  controls.style.marginBottom = '1.5rem';
  controls.innerHTML = decades.map(d => `<button class="top-movie-btn" data-decade="${d}">${d}</button>`).join(' ');
  container.appendChild(controls);
  Array.from(controls.querySelectorAll('button')).forEach(btn => {
    btn.onclick = () => {
      currentDecade = btn.dataset.decade;
      renderChart();
      updateActive();
    };
  });
  function updateActive() {
    Array.from(controls.querySelectorAll('button')).forEach(btn => {
      btn.classList.toggle('active', btn.dataset.decade === currentDecade);
    });
  }
  updateActive();

  const chartDiv = document.createElement('div');
  container.appendChild(chartDiv);

  function renderChart() {
    chartDiv.innerHTML = '';
    const canvas = document.createElement('canvas');
    chartDiv.appendChild(canvas);
    const movies = data.top_movies_by_decade[currentDecade];
    const minDuration = Math.min(...movies.map(m => m.duration));
    const maxDuration = Math.max(...movies.map(m => m.duration));
    const minScore = Math.min(...movies.map(m => m.score));
    const maxScore = Math.max(...movies.map(m => m.score));
    function scaleRadius(score) {
      const minR = 12, maxR = 38; // Reducido el tamaño máximo
      return minR + (score - minScore) / (maxScore - minScore) * (maxR - minR);
    }
    const xMin = 0, xMax = 11;
    const xPositions = movies.map((_, i) => i + 1);
    const yMin = Math.min(60, minDuration - 10);
    const yMax = Math.max(180, maxDuration + 10);
    const chart = new Chart(canvas, {
      type: 'bubble',
      data: {
        datasets: movies.map((m, i) => ({
          label: `${m.title} (${m.year})`,
          data: [{ x: xPositions[i], y: m.duration, r: scaleRadius(m.score) }],
          backgroundColor: '#61afefcc',
          borderColor: '#F9E166',
          borderWidth: 2,
          hoverBackgroundColor: '#d24e7a',
          hoverBorderColor: '#F9E166',
          pointStyle: 'circle',
          imdbLink: m.link
        }))
      },
      options: {
        responsive: true,
        layout: {
          padding: { left: 40, right: 40, top: 20, bottom: 20 }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function(context) {
                const d = context.dataset;
                return `${d.label}\nDuración: ${d.data[0].y} min\nPuntaje: ${((d.data[0].r-10)/(28-10)*(maxScore-minScore)+minScore).toFixed(1)}`;
              }
            }
          }
        },
        scales: {
          x: {
            display: false,
            min: xMin,
            max: xMax
          },
          y: {
            title: { display: true, text: 'Duración (minutos)' },
            min: yMin,
            max: yMax,
            ticks: { color: '#F9E166', font: { size: 14 } },
            grid: { color: '#23294622' }
          }
        },
        onClick: (e, elements) => {
          if (elements.length > 0) {
            const idx = elements[0].datasetIndex;
            const imdb = chart.data.datasets[idx].imdbLink;
            if (imdb) window.open(imdb, '_blank');
          }
        }
      }
    });
  }
  renderChart();
}

// Custom cursor llamativo
const cursor = document.createElement('div');
cursor.classList.add('custom-cursor');
document.body.appendChild(cursor);

document.addEventListener('mousemove', (e) => {
  cursor.style.left = e.clientX + 'px';
  cursor.style.top = e.clientY + 'px';
});

document.addEventListener('mousedown', () => {
  cursor.classList.add('active');
});
document.addEventListener('mouseup', () => {
  cursor.classList.remove('active');
});

// Agranda el cursor sobre elementos interactivos
['a', 'button', '.viz', 'img'].forEach(sel => {
  document.querySelectorAll(sel).forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('active'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('active'));
  });
}); 