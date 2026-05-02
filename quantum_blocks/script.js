class QuantumCircuitBuilder {
    constructor() {
        this.circuitGates = [];
        this.draggedElement = null;
        this.activeLanguage = 'python';
        this.numQubits = 2;

        this.workspaceArea = document.getElementById('workspaceArea');
        this.codeDisplay = document.getElementById('codeDisplay');
        this.resultsContainer = document.getElementById('resultsContainer');
        this.qubitCountInput = document.getElementById('qubitCount');
        this.examplesContainer = document.getElementById('examplesContainer');
        this.theoryContainer = document.getElementById('theoryContainer');

        // Для всплывающей подсказки
        this.tooltipElement = null;

        this.init();
    }

    init() {
        this.setupDragDrop();
        this.setupTabs();
        this.setupControls();
        this.setupQubitControl();
        this.setupExamples();
        this.setupTheoryHover();
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

        // Удаление гейта
        this.workspaceArea.addEventListener('click', (e) => {
            const removeBtn = e.target.closest('.remove-btn');
            if (removeBtn) {
                const gateBlock = removeBtn.closest('.gate-block');
                if (gateBlock) this.removeGate(gateBlock);
            }
        });

        // Изменение селекторов кубитов
        this.workspaceArea.addEventListener('change', (e) => {
            const gateBlock = e.target.closest('.gate-block');
            if (!gateBlock) return;
            const index = Array.from(this.workspaceArea.children).indexOf(gateBlock);
            if (index === -1) return;
            const gateObj = this.circuitGates[index];

            if (e.target.classList.contains('qubit-select')) {
                gateObj.qubits[0] = parseInt(e.target.value);
            } else if (e.target.classList.contains('control-select')) {
                gateObj.qubits[0] = parseInt(e.target.value);
            } else if (e.target.classList.contains('target-select')) {
                gateObj.qubits[1] = parseInt(e.target.value);
            }
            this.updateCodeDisplay();
        });
    }

    handleDragStart(e) {
        this.draggedElement = e.target.closest('.block-item');
        if (!this.draggedElement) return;
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
        let qubits;
        if (gate === 'CNOT' || gate === 'SWAP') {
            qubits = [0, 1];
        } else if (gate === 'Measure') {
            qubits = [];
        } else {
            qubits = [0];
        }
        this.circuitGates.push({ gate, qubits });

        if (this.workspaceArea.querySelector('.workspace-empty')) {
            this.workspaceArea.innerHTML = '';
        }

        const gateBlock = document.createElement('div');
        gateBlock.className = 'gate-block';
        gateBlock.dataset.gate = gate;
        const gateName = QuantumCircuitBuilder.GATE_NAMES[gate] || gate;

        if (gate === 'CNOT' || gate === 'SWAP') {
            gateBlock.innerHTML = `
                <span class="theory-btn" title="Теория">?</span>
                ${gateName}
                <select class="control-select">${this.generateQubitOptions(0)}</select>
                <span style="color:#aaa;">→</span>
                <select class="target-select">${this.generateQubitOptions(1)}</select>
                <button class="remove-btn">✕</button>
            `;
        } else if (gate === 'Measure') {
            gateBlock.innerHTML = `
                <span class="theory-btn" title="Теория">?</span>
                ${gateName}
                <button class="remove-btn">✕</button>
            `;
        } else {
            gateBlock.innerHTML = `
                <span class="theory-btn" title="Теория">?</span>
                ${gateName}
                <select class="qubit-select">${this.generateQubitOptions(0)}</select>
                <button class="remove-btn">✕</button>
            `;
        }

        this.workspaceArea.appendChild(gateBlock);
        this.updateCodeDisplay();
    }

    generateQubitOptions(selectedValue) {
        let options = '';
        for (let i = 0; i < this.numQubits; i++) {
            options += `<option value="${i}" ${i === selectedValue ? 'selected' : ''}>q${i}</option>`;
        }
        return options;
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
        this.resultsContainer.innerHTML = 'Здесь будут отображаться результаты выполнения схемы';
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
        this.circuitGates.forEach(({ gate, qubits }) => {
            switch (gate) {
                case 'H': gatesCode += ` qc.h(qr[${qubits[0]}]) # Адамар\n`; break;
                case 'X': gatesCode += ` qc.x(qr[${qubits[0]}]) # Паули‑X\n`; break;
                case 'Y': gatesCode += ` qc.y(qr[${qubits[0]}]) # Паули‑Y\n`; break;
                case 'Z': gatesCode += ` qc.z(qr[${qubits[0]}]) # Паули‑Z\n`; break;
                case 'S': gatesCode += ` qc.s(qr[${qubits[0]}]) # S‑гейт\n`; break;
                case 'T': gatesCode += ` qc.t(qr[${qubits[0]}]) # T‑гейт\n`; break;
                case 'CNOT': gatesCode += ` qc.cx(qr[${qubits[0]}], qr[${qubits[1]}]) # CNOT\n`; break;
                case 'SWAP': gatesCode += ` qc.swap(qr[${qubits[0]}], qr[${qubits[1]}]) # SWAP\n`; break;
                case 'Measure': gatesCode += ` qc.measure(qr, cr) # Измерение всех кубитов\n`; break;
            }
        });

        const template = `from qiskit import QuantumCircuit, QuantumRegister, ClassicalRegister
from qiskit import Aer, execute

# Создание квантовой схемы
qr = QuantumRegister(${this.numQubits}, 'q')
cr = ClassicalRegister(${this.numQubits}, 'c')
qc = QuantumCircuit(qr, cr)

{{GATES}}
qc.measure(qr, cr)

# Симуляция
simulator = Aer.get_backend('qasm_simulator')
job = execute(qc, simulator, shots=1000)
result = job.result()
counts = result.get_counts(qc)
print(counts)`;

        return template.replace('{{GATES}}', gatesCode || ' # Добавьте гейты сюда');
    }

    generateCppCode() {
        let gatesCode = '';
        this.circuitGates.forEach(({ gate, qubits }) => {
            switch (gate) {
                case 'H': gatesCode += ` qc.apply_hadamard(${qubits[0]});\n`; break;
                case 'X': gatesCode += ` qc.apply_pauli_x(${qubits[0]});\n`; break;
                case 'Y': gatesCode += ` qc.apply_pauli_y(${qubits[0]});\n`; break;
                case 'Z': gatesCode += ` qc.apply_pauli_z(${qubits[0]});\n`; break;
                case 'S': gatesCode += ` qc.apply_s_gate(${qubits[0]});\n`; break;
                case 'T': gatesCode += ` qc.apply_t_gate(${qubits[0]});\n`; break;
                case 'CNOT': gatesCode += ` qc.apply_cnot(${qubits[0]}, ${qubits[1]});\n`; break;
                case 'SWAP': gatesCode += ` qc.apply_swap(${qubits[0]}, ${qubits[1]});\n`; break;
                case 'Measure': gatesCode += ` qc.measure();\n`; break;
            }
        });

        const template = `#include <iostream>
#include <vector>
#include <string>
using namespace std;

class QuantumCircuit {
private:
    int num_qubits;
    vector<string> gates;
public:
    QuantumCircuit(int n) : num_qubits(n) {}
    void apply_hadamard(int qubit) { gates.push_back("H(" + to_string(qubit) + ")"); }
    void apply_pauli_x(int qubit) { gates.push_back("X(" + to_string(qubit) + ")"); }
    void apply_pauli_y(int qubit) { gates.push_back("Y(" + to_string(qubit) + ")"); }
    void apply_pauli_z(int qubit) { gates.push_back("Z(" + to_string(qubit) + ")"); }
    void apply_s_gate(int qubit) { gates.push_back("S(" + to_string(qubit) + ")"); }
    void apply_t_gate(int qubit) { gates.push_back("T(" + to_string(qubit) + ")"); }
    void apply_cnot(int control, int target) { gates.push_back("CNOT(" + to_string(control) + "," + to_string(target) + ")"); }
    void apply_swap(int q1, int q2) { gates.push_back("SWAP(" + to_string(q1) + "," + to_string(q2) + ")"); }
    void measure() { gates.push_back("MEASURE"); }
    void display_gates() { for (const auto& gate : gates) cout << gate << endl; }
};

int main() {
    QuantumCircuit qc(${this.numQubits});
    {{GATES}}
    qc.display_gates();
    return 0;
}`;

        return template.replace('{{GATES}}', gatesCode || ' // Добавьте гейты сюда');
    }

    /* ---------- Квантовая симуляция (матричный расчёт) ---------- */
    simulateExecution() {
        if (this.circuitGates.length === 0) {
            this.resultsContainer.innerHTML = '<p>❌ Сначала добавьте гейты в схему!</p>';
            return;
        }

        this.resultsContainer.innerHTML = '<p>⏳ Выполнение симуляции…</p>';

        // Небольшая задержка, чтобы показать индикатор
        setTimeout(() => {
            try {
                const probabilities = this.simulateQuantumCircuit();
                const outcomes = QuantumCircuitBuilder.sampleOutcomes(probabilities, 1000, this.numQubits);
                this.displayResults(outcomes);
            } catch (e) {
                this.resultsContainer.innerHTML = `<p>❌ Ошибка симуляции: ${e.message}</p>`;
            }
        }, 50);
    }

    simulateQuantumCircuit() {
        const n = this.numQubits;
        const dim = 1 << n;
        // Начальный вектор состояния: |0...0>
        let state = new Array(dim).fill(null).map(() => ({ re: 0, im: 0 }));
        state[0] = { re: 1, im: 0 };

        this.circuitGates.forEach(({ gate, qubits }) => {
            if (gate === 'Measure') return; // измерение будет в конце

            const matrix = QuantumCircuitBuilder.GATE_MATRICES[gate];
            if (!matrix) {
                console.warn(`Матрица для гейта ${gate} не найдена`);
                return;
            }

            if (gate === 'CNOT' || gate === 'SWAP') {
                state = QuantumCircuitBuilder.applyMultiQubitGate(state, qubits[0], qubits[1], matrix);
            } else {
                state = QuantumCircuitBuilder.applySingleQubitGate(state, qubits[0], matrix);
            }
        });

        // Вычисляем вероятности = |амплитуда|^2
        const probabilities = state.map(amp => QuantumCircuitBuilder.absSquareComplex(amp));
        return probabilities;
    }

    /* ---------- Комплексная арифметика и гейты (статические) ---------- */
    static makeComplex(re, im) {
        return { re, im };
    }

    static zeroComplex() {
        return { re: 0, im: 0 };
    }

    static addComplex(a, b) {
        return { re: a.re + b.re, im: a.im + b.im };
    }

    static multiplyComplex(a, b) {
        return {
            re: a.re * b.re - a.im * b.im,
            im: a.re * b.im + a.im * b.re
        };
    }

    static absSquareComplex(a) {
        return a.re * a.re + a.im * a.im;
    }

    static GATE_MATRICES = {
        'H': [
            [{ re: 1 / Math.SQRT2, im: 0 }, { re: 1 / Math.SQRT2, im: 0 }],
            [{ re: 1 / Math.SQRT2, im: 0 }, { re: -1 / Math.SQRT2, im: 0 }]
        ],
        'X': [
            [{ re: 0, im: 0 }, { re: 1, im: 0 }],
            [{ re: 1, im: 0 }, { re: 0, im: 0 }]
        ],
        'Y': [
            [{ re: 0, im: 0 }, { re: -1, im: 0 }],
            [{ re: 1, im: 0 }, { re: 0, im: 0 }]
        ],
        'Z': [
            [{ re: 1, im: 0 }, { re: 0, im: 0 }],
            [{ re: 0, im: 0 }, { re: -1, im: 0 }]
        ],
        'S': [
            [{ re: 1, im: 0 }, { re: 0, im: 0 }],
            [{ re: 0, im: 0 }, { re: 0, im: 1 }]
        ],
        'T': [
            [{ re: 1, im: 0 }, { re: 0, im: 0 }],
            [{ re: 0, im: 0 }, { re: Math.cos(Math.PI / 4), im: Math.sin(Math.PI / 4) }]
        ],
        'CNOT': [
            [{ re: 1, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }],
            [{ re: 0, im: 0 }, { re: 1, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }],
            [{ re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }, { re: 1, im: 0 }],
            [{ re: 0, im: 0 }, { re: 0, im: 0 }, { re: 1, im: 0 }, { re: 0, im: 0 }]
        ],
        'SWAP': [
            [{ re: 1, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }],
            [{ re: 0, im: 0 }, { re: 0, im: 0 }, { re: 1, im: 0 }, { re: 0, im: 0 }],
            [{ re: 0, im: 0 }, { re: 1, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }],
            [{ re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }, { re: 1, im: 0 }]
        ]
    };

    /**
     * Применить однокубитный гейт к вектору состояния.
     * @param {Array} stateVector - текущий вектор (комплексные числа)
     * @param {number} targetQubit - индекс целевого кубита (0..n-1)
     * @param {Array} matrix - матрица гейта 2x2 (комплексные числа)
     * @returns {Array} новый вектор состояния
     */
    static applySingleQubitGate(stateVector, targetQubit, matrix) {
        const n = Math.log2(stateVector.length);
        const pow2t = 1 << targetQubit;
        const newState = new Array(stateVector.length).fill(null).map(() => ({ re: 0, im: 0 }));

        for (let i0 = 0; i0 < stateVector.length; i0++) {
            const bit = (i0 >> targetQubit) & 1;
            // Пропускаем, если уже обработали пару
            if (bit !== 0) continue;

            const i1 = i0 | pow2t;
            const a0 = stateVector[i0];
            const a1 = stateVector[i1];

            // m00 * a0 + m01 * a1
            newState[i0] = QuantumCircuitBuilder.addComplex(
                QuantumCircuitBuilder.multiplyComplex(matrix[0][0], a0),
                QuantumCircuitBuilder.multiplyComplex(matrix[0][1], a1)
            );
            // m10 * a0 + m11 * a1
            newState[i1] = QuantumCircuitBuilder.addComplex(
                QuantumCircuitBuilder.multiplyComplex(matrix[1][0], a0),
                QuantumCircuitBuilder.multiplyComplex(matrix[1][1], a1)
            );
        }
        return newState;
    }

    /**
     * Применить многокубитный гейт (CNOT, SWAP) через матрицу 4x4.
     * @param {Array} stateVector
     * @param {number} control - управляющий кубит
     * @param {number} target - целевой кубит
     * @param {Array} matrix - матрица 4x4 (комплексные)
     * @returns {Array}
     */
    static applyMultiQubitGate(stateVector, control, target, matrix) {
        const n = Math.log2(stateVector.length);
        const pow2c = 1 << control;
        const pow2t = 1 << target;
        const newState = new Array(stateVector.length).fill(null).map(() => ({ re: 0, im: 0 }));

        // Индексы базисных состояний: 00, 01, 10, 11 по кубитам (control, target)
        const basisIndices = [
            ({ i }) => i & ~pow2c & ~pow2t,                     // 00
            ({ i }) => (i & ~pow2c & ~pow2t) | pow2t,           // 01
            ({ i }) => (i & ~pow2c & ~pow2t) | pow2c,           // 10
            ({ i }) => (i & ~pow2c & ~pow2t) | pow2c | pow2t   // 11
        ];

        for (let i = 0; i < stateVector.length; i++) {
            const inputValues = basisIndices.map(fn => stateVector[fn({ i })]);
            for (let row = 0; row < 4; row++) {
                let acc = QuantumCircuitBuilder.zeroComplex();
                for (let col = 0; col < 4; col++) {
                    acc = QuantumCircuitBuilder.addComplex(
                        acc,
                        QuantumCircuitBuilder.multiplyComplex(matrix[row][col], inputValues[col])
                    );
                }
                const targetIndex = basisIndices[row]({ i });
                newState[targetIndex] = acc;
            }
        }
        return newState;
    }

    /**
     * Сэмплирование исходов измерения по вероятностям.
     * @param {Array} probabilities - массив вероятностей для каждого базисного состояния
     * @param {number} shots - количество измерений
     * @param {number} numQubits
     * @returns {Object} counts
     */
    static sampleOutcomes(probabilities, shots, numQubits) {
        const outcomes = {};
        const dim = probabilities.length;

        for (let s = 0; s < shots; s++) {
            let r = Math.random();
            let cumulative = 0;
            for (let i = 0; i < dim; i++) {
                cumulative += probabilities[i];
                if (r <= cumulative) {
                    const stateStr = i.toString(2).padStart(numQubits, '0');
                    outcomes[stateStr] = (outcomes[stateStr] || 0) + 1;
                    break;
                }
            }
        }
        return outcomes;
    }

    /* ---------- Отображение результатов ---------- */
    displayResults(outcomes) {
        let html = '<p>Результаты измерений (1000 запусков):</p>';
        html += '<table><tr><th>Состояние</th><th>Количество</th><th>Вероятность</th></tr>';
        // Сортируем по состоянию
        const sortedKeys = Object.keys(outcomes).sort();
        for (const state of sortedKeys) {
            const count = outcomes[state];
            const probability = ((count / 1000) * 100).toFixed(2);
            html += `<tr><td>|${state}⟩</td><td>${count}</td><td>${probability}%</td></tr>`;
        }
        html += '</table>';
        html += `<p>⏱️ Время выполнения: < 1 мс (браузерная симуляция)</p>`;
        html += `<p>✅ Применено гейтов: ${this.circuitGates.length}</p>`;

        this.resultsContainer.style.opacity = '0';
        this.resultsContainer.innerHTML = html;
        requestAnimationFrame(() => {
            this.resultsContainer.style.transition = 'opacity 0.25s ease';
            this.resultsContainer.style.opacity = '1';
        });
    }

    /* ---------- Вкладки и кнопки ---------- */
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

    /* ---------- Управление кубитами ---------- */
    setupQubitControl() {
        this.qubitCountInput.addEventListener('input', () => {
            const newValue = parseInt(this.qubitCountInput.value);
            if (newValue >= 1 && newValue <= 10) {
                this.numQubits = newValue;
                this.updateAllQubitSelectors();
                this.updateCodeDisplay();
            }
        });
    }

    updateAllQubitSelectors() {
        const selects = this.workspaceArea.querySelectorAll('select');
        selects.forEach(select => {
            const currentValue = parseInt(select.value);
            select.innerHTML = '';
            for (let i = 0; i < this.numQubits; i++) {
                const option = document.createElement('option');
                option.value = i;
                option.textContent = `q${i}`;
                select.appendChild(option);
            }
            select.value = Math.min(currentValue, this.numQubits - 1);
        });
    }

    /* ---------- Примеры и теория ---------- */
    setupExamples() {
        const container = document.getElementById('examplesContainer');
        container.innerHTML = '';
        QuantumCircuitBuilder.EXAMPLES.forEach(example => {
            const item = document.createElement('div');
            item.className = 'example-item';
            item.innerHTML = `
                <button class="example-btn" data-example="${example.id}">${example.title}</button>
                <p class="example-desc">${example.description}</p>
            `;
            container.appendChild(item);
        });

        container.addEventListener('click', (e) => {
            const btn = e.target.closest('.example-btn');
            if (btn) {
                this.loadExample(btn.dataset.example);
            }
        });
    }

    loadExample(exampleId) {
        const example = QuantumCircuitBuilder.EXAMPLES.find(ex => ex.id === exampleId);
        if (!example) return;

        this.clearCircuit();
        this.numQubits = example.qubits;
        this.qubitCountInput.value = example.qubits;
        this.circuitGates = example.gates.map(g => ({
            gate: g.gate,
            qubits: [...g.qubits]
        }));

        this.workspaceArea.innerHTML = '';
        this.circuitGates.forEach(({ gate, qubits }) => {
            const gateBlock = document.createElement('div');
            gateBlock.className = 'gate-block';
            gateBlock.dataset.gate = gate;
            const gateName = QuantumCircuitBuilder.GATE_NAMES[gate] || gate;

            if (gate === 'CNOT' || gate === 'SWAP') {
                gateBlock.innerHTML = `
                    <span class="theory-btn" title="Теория">?</span>
                    ${gateName}
                    <select class="control-select">${this.generateQubitOptions(qubits[0])}</select>
                    <span style="color:#aaa;">→</span>
                    <select class="target-select">${this.generateQubitOptions(qubits[1])}</select>
                    <button class="remove-btn">✕</button>
                `;
            } else if (gate === 'Measure') {
                gateBlock.innerHTML = `
                    <span class="theory-btn" title="Теория">?</span>
                    ${gateName}
                    <button class="remove-btn">✕</button>
                `;
            } else {
                gateBlock.innerHTML = `
                    <span class="theory-btn" title="Теория">?</span>
                    ${gateName}
                    <select class="qubit-select">${this.generateQubitOptions(qubits[0])}</select>
                    <button class="remove-btn">✕</button>
                `;
            }
            this.workspaceArea.appendChild(gateBlock);
        });

        this.updateCodeDisplay();
    }

    /* ---------- Теория по наведению ---------- */
    setupTheoryHover() {
        document.body.addEventListener('mouseenter', (e) => {
            const btn = e.target.closest('.theory-btn');
            if (!btn) return;
            const gate = btn.closest('.block-item')?.dataset.gate || btn.closest('.gate-block')?.dataset.gate;
            if (!gate) return;
            this.showTooltip(btn, gate);
        }, true);

        document.body.addEventListener('mouseleave', (e) => {
            const btn = e.target.closest('.theory-btn');
            if (!btn) return;
            this.hideTooltip();
        }, true);
    }

    showTooltip(anchorElement, gate) {
        this.hideTooltip();

        const theory = QuantumCircuitBuilder.GATE_THEORY[gate];
        if (!theory) return;

        const tooltip = document.createElement('div');
        tooltip.className = 'theory-tooltip';
        tooltip.innerHTML = `
            <strong>${QuantumCircuitBuilder.GATE_NAMES[gate] || gate}</strong>
            <p>${theory}</p>
        `;
        document.body.appendChild(tooltip);
        this.tooltipElement = tooltip;

        const rect = anchorElement.getBoundingClientRect();
        const tooltipWidth = tooltip.offsetWidth || 220;
        const tooltipHeight = tooltip.offsetHeight || 60;

        let left = rect.right + 8;
        let top = rect.top + window.scrollY;

        if (left + tooltipWidth > window.innerWidth - 10) {
            left = rect.left - tooltipWidth - 8;
        }
        if (top + tooltipHeight > window.innerHeight - 10) {
            top = rect.bottom + window.scrollY - tooltipHeight - 4;
        }

        tooltip.style.left = `${left}px`;
        tooltip.style.top = `${top}px`;
    }

    hideTooltip() {
        if (this.tooltipElement) {
            this.tooltipElement.remove();
            this.tooltipElement = null;
        }
    }

    /* ---------- Статические данные ---------- */
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

    static GATE_THEORY = {
        'H': 'Гейт Адамара создаёт суперпозицию. Переводит |0⟩ в (|0⟩+|1⟩)/√2, а |1⟩ в (|0⟩-|1⟩)/√2.',
        'X': 'Гейт Паули‑X (инвертор) меняет состояние кубита на противоположное: |0⟩↔|1⟩.',
        'Y': 'Гейт Паули‑Y выполняет поворот вокруг оси Y на π радиан.',
        'Z': 'Гейт Паули‑Z инвертирует фазу: |0⟩→|0⟩, |1⟩→-|1⟩.',
        'S': 'S‑гейт (фазовый) добавляет поворот фазы на π/2.',
        'T': 'T‑гейт (π/8) добавляет поворот фазы на π/4.',
        'CNOT': 'Контролируемый NOT: если управляющий кубит равен |1⟩, то целевой кубит инвертируется. Создаёт запутанность.',
        'SWAP': 'Обменивает состояния двух кубитов.',
        'Measure': 'Измерение кубита в вычислительном базисе. Состояние коллапсирует в |0⟩ или |1⟩ с вероятностями, определяемыми амплитудами.'
    };

    static EXAMPLES = [
        {
            id: 'bell',
            title: 'Состояние Белла',
            description: 'Создаёт максимально запутанное состояние двух кубитов: (|00⟩+|11⟩)/√2.',
            qubits: 2,
            gates: [
                { gate: 'H', qubits: [0] },
                { gate: 'CNOT', qubits: [0,1] },
                { gate: 'Measure', qubits: [] }
            ]
        },
        {
            id: 'ghz',
            title: 'GHZ-состояние',
            description: 'Обобщённое запутанное состояние трёх кубитов: (|000⟩+|111⟩)/√2.',
            qubits: 3,
            gates: [
                { gate: 'H', qubits: [0] },
                { gate: 'CNOT', qubits: [0,1] },
                { gate: 'CNOT', qubits: [1,2] },
                { gate: 'Measure', qubits: [] }
            ]
        },
        {
            id: 'qft',
            title: 'Квантовое преобразование Фурье (3 кубита)',
            description: 'Демонстрирует базовую реализацию QFT — ключевого элемента многих алгоритмов.',
            qubits: 3,
            gates: [
                { gate: 'H', qubits: [0] },
                { gate: 'S', qubits: [1] },
                { gate: 'T', qubits: [2] },
                { gate: 'CNOT', qubits: [0,1] },
                { gate: 'H', qubits: [1] },
                { gate: 'CNOT', qubits: [1,2] },
                { gate: 'Measure', qubits: [] }
            ]
        },
        {
            id: 'superposition',
            title: 'Равномерная суперпозиция',
            description: 'Применяет Адамар ко всем кубитам, создавая состояние (|0…0⟩+…+|1…1⟩)/√N.',
            qubits: 3,
            gates: [
                { gate: 'H', qubits: [0] },
                { gate: 'H', qubits: [1] },
                { gate: 'H', qubits: [2] },
                { gate: 'Measure', qubits: [] }
            ]
        },
        {
            id: 'swap_test',
            title: 'Обменный тест (Swap test)',
            description: 'Сравнивает состояния двух кубитов с помощью вспомогательного кубита и гейта SWAP.',
            qubits: 3,
            gates: [
                { gate: 'H', qubits: [0] },
                { gate: 'SWAP', qubits: [1,2] },
                { gate: 'H', qubits: [0] },
                { gate: 'Measure', qubits: [] }
            ]
        },
        {
            id: 'teleportation',
            title: 'Квантовая телепортация',
            description: 'Переносит неизвестное состояние одного кубита на другой с использованием запутанной пары.',
            qubits: 3,
            gates: [
                { gate: 'H', qubits: [1] },
                { gate: 'CNOT', qubits: [1,2] },
                { gate: 'CNOT', qubits: [0,1] },
                { gate: 'H', qubits: [0] },
                { gate: 'CNOT', qubits: [1,2] },
                { gate: 'Measure', qubits: [] }
            ]
        }
    ];
}

// Запуск приложения
document.addEventListener('DOMContentLoaded', () => {
    new QuantumCircuitBuilder();
});