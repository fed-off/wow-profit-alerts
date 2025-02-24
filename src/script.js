document.addEventListener('DOMContentLoaded', () => {
  const recipe = recipes.midnightMasqueradeFeast;
  const DEFAULT_PROC_FACTOR = 1.5;

  // Элементы DOM
  const sharkQty = document.getElementById('shark-qty');
  const sharkPrice = document.getElementById('shark-price');
  const steakQty = document.getElementById('steak-qty');
  const steakPrice = document.getElementById('steak-price');
  const brothQty = document.getElementById('broth-qty');
  const brothPrice = document.getElementById('broth-price');
  const herbsQty = document.getElementById('herbs-qty');
  const herbsPrice = document.getElementById('herbs-price');
  const honeyQty = document.getElementById('honey-qty');
  const honeyPrice = document.getElementById('honey-price');
  const feastQty = document.getElementById('feast-qty');
  const feastPrice = document.getElementById('feast-price');
  const resetBtn = document.getElementById('reset');
  const toggleReagentsBtn = document.getElementById('toggle-reagents');
  const otherReagents = document.getElementById('other-reagents');
  const toggleAnalyticsBtn = document.getElementById('toggle-analytics');
  const detailedAnalytics = document.getElementById('detailed-analytics');

  // График
  const ctx = document.getElementById('profit-graph').getContext('2d');
  let chart;

  // Загрузка данных
  function loadData() {
    const saved = JSON.parse(localStorage.getItem('wowProfitData')) || {};
    const now = new Date().setHours(0, 0, 0, 0);
    if (saved.date === now) {
      sharkQty.value = saved.sharkQty || 1000;
      sharkPrice.value = saved.sharkPrice || 500;
      steakPrice.value = saved.steakPrice || 3;
      brothPrice.value = saved.brothPrice || 3;
      herbsPrice.value = saved.herbsPrice || 0.2;
      honeyPrice.value = saved.honeyPrice || 20;
      feastPrice.value = saved.feastPrice || 410;
      feastQty.value = saved.feastQty || 1500;
    }
    updateQuantities();
    calculate();
  }

  // Сохранение данных
  function saveData() {
    const data = {
      date: new Date().setHours(0, 0, 0, 0),
      sharkQty: sharkQty.value,
      sharkPrice: sharkPrice.value,
      steakPrice: steakPrice.value,
      brothPrice: brothPrice.value,
      herbsPrice: herbsPrice.value,
      honeyPrice: honeyPrice.value,
      feastPrice: feastPrice.value,
      feastQty: feastQty.value,
    };
    localStorage.setItem('wowProfitData', JSON.stringify(data));
  }

  // Обновление количества
  function updateQuantities() {
    const sharks = parseInt(sharkQty.value) || 5;
    const sets = sharks / 5;
    steakQty.value = sets * 60;
    brothQty.value = sets * 15;
    herbsQty.value = sets * 50;
    honeyQty.value = sets * 1;
    if (!feastQty.dataset.userEdited || event?.target === sharkQty) {
      feastQty.value = sets * recipe.yield * DEFAULT_PROC_FACTOR;
      feastQty.dataset.userEdited = false;
    }
  }

  // Расчёт и вывод
  function calculate() {
    const sharks = parseInt(sharkQty.value) || 5;
    const totalItems = parseInt(feastQty.value) || 1;
    const analysis = calculateProfit(
      recipe,
      parseFloat(feastPrice.value),
      parseFloat(sharkPrice.value),
      sharks,
      totalItems
    );

    document.getElementById('profit-per-shark').textContent = `${analysis.profitPerShark} золота`;
    document.getElementById('min-sell-price').textContent = `${analysis.minSellPrice} золота`;

    document.getElementById('cost-per-feast').textContent = `${analysis.adjustedCost} золота`;
    document.getElementById('profit-percentage').textContent = `${analysis.profitPercentage}%`;
    document.getElementById('profit-step').textContent = `${analysis.profitStepPerShark} золота`;
    document.getElementById('recommended-price').textContent = `${analysis.recommendedSellPrice} золота`;
    document.getElementById('total-cost').textContent = `${analysis.totalCost} золота`;
    document.getElementById('total-profit').textContent = `${analysis.totalProfit} золота`;
    document.getElementById('target-30k').textContent = `${analysis.targetSellPrice30k} золота`;
    document.getElementById('target-50k').textContent = `${analysis.targetSellPrice50k} золота`;

    if (chart) chart.destroy();
    chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: analysis.graphData.map(d => d.price),
        datasets: [{
          data: analysis.graphData.map(d => d.profit),
          borderColor: '#ffd700',
          backgroundColor: 'rgba(255, 215, 0, 0.2)',
          fill: true,
          pointRadius: 6,
          pointHoverRadius: 8,
          pointStyle: 'circle',
        }],
      },
      options: {
        scales: {
          x: {
            title: { display: true, text: 'Цена продажи (золото)', color: '#fff' },
            grid: { display: true, color: 'rgba(255, 255, 255, 0.1)' },
          },
          y: {
            title: { display: true, text: 'Прибыль (золото)', color: '#fff' },
            grid: { display: true, color: 'rgba(255, 255, 255, 0.1)' },
          },
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            displayColors: false, // Убираем квадратик с цветом
            callbacks: {
              label: (context) => {
                const data = analysis.graphData[context.dataIndex];
                return [
                  `Общая прибыль: ${data.profit} золота`,
                  `Прибыль за 1 пир: ${data.profitPerItem} золота`,
                ];
              },
            },
          },
        },
        elements: { point: { cursor: 'pointer' } },
      },
    });

    saveData();
  }

  // Сброс
  function reset() {
    sharkQty.value = 1000;
    sharkPrice.value = 500;
    steakPrice.value = 3;
    brothPrice.value = 3;
    herbsPrice.value = 0.2;
    honeyPrice.value = 20;
    feastPrice.value = 410;
    feastQty.value = 1500;
    feastQty.dataset.userEdited = false;
    updateQuantities();
    calculate();
    localStorage.removeItem('wowProfitData');
  }

  // Переключение видимости реагентов
  toggleReagentsBtn.addEventListener('click', () => {
    otherReagents.classList.toggle('hidden');
    toggleReagentsBtn.textContent = otherReagents.classList.contains('hidden') ? 'Развернуть' : 'Свернуть';
  });

  // Переключение аналитики
  toggleAnalyticsBtn.addEventListener('click', () => {
    detailedAnalytics.classList.toggle('hidden');
    toggleAnalyticsBtn.textContent = detailedAnalytics.classList.contains('hidden') ? 'Подробно' : 'Скрыть';
  });

  // Отслеживание ручного ввода количества пиров
  feastQty.addEventListener('input', () => {
    feastQty.dataset.userEdited = true;
  });

  // События
  const inputs = [sharkQty, sharkPrice, steakPrice, brothPrice, herbsPrice, honeyPrice, feastPrice, feastQty];
  inputs.forEach(input =>
    input.addEventListener('input', () => {
      updateQuantities();
      calculate();
    })
  );
  resetBtn.addEventListener('click', reset);

  // Инициализация
  loadData();
});