/**
 * Конструктор квантовых схем
 * Приложение с перетаскиванием гейтов и генерацией кода в реальном времени.
 * Логика инкапсулирована в класс для предотвращения загрязнения глобальной области видимости.
 */
class QuantumCircuitBuilder {
    constructor() {
        this.circuitGates = [];
        this.draggedElement = null;
        this.activeLanguage = 'python';

        this.workspaceArea = document.getElementById('workspaceArea');
        this.codeDisplay = document.getElementById('codeDisplay');
        this.resultsContainer = document.getElementById('resultsContainer');

        this.init();
    }

    init() {
        this.setupDragDrop();
        this.setupTabs();
        this.setupControls();
        this.updateCodeDisplay();
    }

    /* ---------- Drag & Drop ---------- */
    setupDragDrop() {
        const blockItems = document.querySelectorAll('.block-item');

        blockItems.forEach(item => {
            item.addEventListener('dragstart', (e) => this.handleDragStart(e));
        });

        this.workspaceArea.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.workspaceArea.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        this.workspaceArea.addEventListener('drop', (e) => this.handleDrop(e));

        // Делегированная обработка кнопок удаления
        this.workspaceArea.addEventListener('click', (e) => {
            const removeBtn = e.target.closest('.remove-btn');
            if (removeBtn) {
                const gateBlock = removeBtn.closest('.gate-block');
                if (gateBlock) {
                    this.removeGate(gateBlock);
                }
            }
        });
    }

    handleDragStart(e) {
        this.draggedElement = e.target.closest('.block-item');
        e.dataTransfer.effectAllowed = 'copy';
        e.dataTransfer.setData('gate', this.draggedElement.dataset.gate);
    }

    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
        this.workspaceArea.classList.add('drag-over');
    }

    handleDragLeave(e) {
        this.workspaceArea.classList.remove('drag-over');
    }

    handleDrop(e) {
        e.preventDefault();
        this.workspaceArea.classList.remove('drag-over');

        const gate = e.dataTransfer.getData('gate');
        if (gate) {
            this.addGateToCircuit(gate);
        }
    }

    /* ---------- Управление цепью ---------- */
    addGateToCircuit(gate) {
        this.circuitGates.push(gate);

        if (this.workspaceArea.querySelector('.workspace-empty')) {
            this.workspaceArea.innerHTML = '';
        }

        const gateBlock = document.createElement('div');
        gateBlock.className = 'gate-block';
        gateBlock.innerHTML = `
            ${QuantumCircuitBuilder.GATE_NAMES[gate] || gate}
            <button class="remove-btn" aria-label="Удалить гейт">✕</button>
        `;

        this.workspaceArea.appendChild(gateBlock);
        this.updateCodeDisplay();
    }

    removeGate(gateBlock) {
        const index = Array.from(this.workspaceArea.children).indexOf(gateBlock);
        if (index > -1) {
            this.circuitGates.splice(index, 1);
            gateBlock.remove();

            if (this.circuitGates.length === 0) {
                this.workspaceArea.innerHTML = '<div class="workspace-empty">Перетащите гейты сюда</div>';
            }

            this.updateCodeDisplay();
        }
    }

    clearCircuit() {
        this.circuitGates = [];
        this.workspaceArea.innerHTML = '<div class="workspace-empty">Перетащите гейты сюда</div>';
        this.resultsContainer.innerHTML = '<p>Здесь будут отображаться результаты выполнения схемы</p>';
        this.updateCodeDisplay();
    }

    /* ---------- Генерация кода ---------- */
    updateCodeDisplay() {
        const pythonCode = this.generatePythonCode();
        const cppCode = this.generateCppCode();

        this.codeDisplay.textContent = this.activeLanguage === 'python' ? pythonCode : cppCode;
    }

    generatePythonCode() {
        let gatesCode = '';
        this.circuitGates.forEach(gate => {
            switch (gate) {
                case 'H':  gatesCode += '    qc.h(qr[0])   # Адамар на кубите 0\n'; break;
                case 'X':  gatesCode += '    qc.x(qr[0])   # Паули‑X на кубите 0\n'; break;
                case 'Y':  gatesCode += '    qc.y(qr[0])   # Паули‑Y на кубите 0\n'; break;
                case 'Z':  gatesCode += '    qc.z(qr[0])   # Паули‑Z на кубите 0\n'; break;
                case 'S':  gatesCode += '    qc.s(qr[0])   # S‑гейт на кубите 0\n'; break;
                case 'T':  gatesCode += '    qc.t(qr[0])   # T‑гейт на кубите 0\n'; break;
                case 'CNOT': gatesCode += '    qc.cx(qr[0], qr[1])  # CNOT: управляющий=0, цель=1\n'; break;
                case 'SWAP': gatesCode += '    qc.swap(qr[0], qr[1])  # SWAP кубитов 0 и 1\n'; break;
                case 'Measure': gatesCode += '    qc.measure(qr, cr)  # Измерение всех кубитов\n'; break;
            }
        });

        return QuantumCircuitBuilder.PYTHON_TEMPLATE.replace('{{GATES}}', gatesCode || '    # Добавьте гейты сюда');
    }

    generateCppCode() {
        let gatesCode = '';
        this.circuitGates.forEach(gate => {
            switch (gate) {
                case 'H':  gatesCode += '    qc.apply_hadamard(0);  // Адамар\n'; break;
                case 'X':  gatesCode += '    qc.apply_pauli_x(0);   // Паули‑X\n'; break;
                case 'Y':  gatesCode += '    qc.apply_pauli_y(0);   // Паули‑Y\n'; break;
                case 'Z':  gatesCode += '    qc.apply_pauli_z(0);   // Паули‑Z\n'; break;
                case 'S':  gatesCode += '    qc.apply_s_gate(0);    // S‑гейт\n'; break;
                case 'T':  gatesCode += '    qc.apply_t_gate(0);    // T‑гейт\n'; break;
                case 'CNOT': gatesCode += '    qc.apply_cnot(0, 1);   // CNOT\n'; break;
                case 'SWAP': gatesCode += '    qc.apply_swap(0, 1);   // SWAP\n'; break;
                case 'Measure': gatesCode += '    qc.measure();           // Измерение\n'; break;
            }
        });

        return QuantumCircuitBuilder.CPP_TEMPLATE.replace('{{GATES}}', gatesCode || '    // Добавьте гейты сюда');
    }

    /* ---------- Симуляция выполнения ---------- */
    simulateExecution() {
        if (this.circuitGates.length === 0) {
            this.resultsContainer.innerHTML = '<p>❌ Сначала добавьте гейты в схему!</p>';
            return;
        }

        // Индикатор загрузки
        this.resultsContainer.innerHTML = '<p>⏳ Выполнение симуляции на виртуальном бэкенде…</p>';

        // Имитация задержки вычислений
        setTimeout(() => {
            const outcomes = this.generateOutcomes();
            this.displayResults(outcomes);
        }, 350);
    }

    generateOutcomes() {
        // Псевдослучайные результаты для 2‑кубитной системы (|00⟩, |01⟩, |10⟩, |11⟩)
        const baseCounts = [280, 230, 260, 230]; // реалистичное распределение
        const outcomes = {};
        const states = ['00', '01', '10', '11'];

        states.forEach((state, i) => {
            const noise = Math.floor(Math.random() * 40) - 20;
            outcomes[state] = Math.max(0, baseCounts[i] + noise);
        });

        // Нормализация до 1000 измерений
        const total = Object.values(outcomes).reduce((sum, val) => sum + val, 0);
        const correction = 1000 - total;
        if (correction !== 0) {
            const firstKey = states[0];
            outcomes[firstKey] = Math.max(0, outcomes[firstKey] + correction);
        }

        return outcomes;
    }

    displayResults(outcomes) {
        let html = '<p><strong>📊 Результаты измерений (1000 запусков):</strong></p>';
        html += '<table><thead><tr><th>Состояние</th><th>Количество</th><th>Вероятность</th></tr></thead><tbody>';

        for (const [state, count] of Object.entries(outcomes)) {
            const probability = ((count / 1000) * 100).toFixed(2);
            html += `<tr><td>|${state}⟩</td><td>${count}</td><td>${probability}%</td></tr>`;
        }

        html += '</tbody></table>';
        const ms = (Math.random() * 50 + 25).toFixed(2);
        html += `<p style="margin-top:14px;"><strong>⏱️ Время выполнения:</strong> ${ms} мс</p>`;
        html += `<p><strong>✅ Применено гейтов:</strong> ${this.circuitGates.length}</p>`;

        // Анимация появления результатов
        this.resultsContainer.style.opacity = '0';
        this.resultsContainer.innerHTML = html;
        requestAnimationFrame(() => {
            this.resultsContainer.style.transition = 'opacity 0.25s ease';
            this.resultsContainer.style.opacity = '1';
        });
    }

    /* ---------- Управление вкладками и кнопками ---------- */
    setupTabs() {
        const tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                tabBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.activeLanguage = btn.dataset.lang;
                this.updateCodeDisplay();
            });
        });
    }

    setupControls() {
        document.getElementById('clearBtn').addEventListener('click', () => this.clearCircuit());
        document.getElementById('executeBtn').addEventListener('click', () => this.simulateExecution());
    }

    /* ---------- Статические шаблоны ---------- */
    static PYTHON_TEMPLATE = `from qiskit import QuantumCircuit, QuantumRegister, ClassicalRegister
from qiskit import Aer, execute

# Создание квантовой схемы
qr = QuantumRegister(2, 'q')
cr = ClassicalRegister(2, 'c')
qc = QuantumCircuit(qr, cr)

{{GATES}}

qc.measure(qr, cr)

# Симуляция
simulator = Aer.get_backend('qasm_simulator')
job = execute(qc, simulator, shots=1000)
result = job.result()
counts = result.get_counts(qc)

print(counts)`;

    static CPP_TEMPLATE = `#include <iostream>
#include <vector>
#include <string>
using namespace std;

class QuantumCircuit {
private:
    int num_qubits;
    vector<string> gates;

public:
    QuantumCircuit(int n) : num_qubits(n) {}

    void apply_hadamard(int qubit) {
        gates.push_back("H(" + to_string(qubit) + ")");
    }

    void apply_pauli_x(int qubit) {
        gates.push_back("X(" + to_string(qubit) + ")");
    }

    void apply_cnot(int control, int target) {
        gates.push_back("CNOT(" + to_string(control) + "," + to_string(target) + ")");
    }

    void display_gates() {
        for (const auto& gate : gates) {
            cout << gate << endl;
        }
    }
};

int main() {
    QuantumCircuit qc(2);

{{GATES}}

    qc.display_gates();
    return 0;
}`;

    static GATE_NAMES = {
        'H': 'Адамар',
        'X': 'Паули‑X',
        'Y': 'Паули‑Y',
        'Z': 'Паули‑Z',
        'S': 'S‑гейт',
        'T': 'T‑гейт',
        'CNOT': 'CNOT',
        'SWAP': 'SWAP',
        'Measure': 'Измерение'
    };
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    new QuantumCircuitBuilder();
});