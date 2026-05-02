// Quantum Block Code Builder - JavaScript
// Drag-drop functionality and code generation

let draggedElement = null;
let circuitGates = [];

const PYTHON_TEMPLATE = `from qiskit import QuantumCircuit, QuantumRegister, ClassicalRegister
from qiskit import Aer, execute

# Create quantum circuit
qr = QuantumRegister(2, 'q')
cr = ClassicalRegister(2, 'c')
qc = QuantumCircuit(qr, cr)

{{GATES}}

qc.measure(qr, cr)

# Simulate
simulator = Aer.get_backend('qsim_simulator')
job = execute(qc, simulator, shots=1000)
result = job.result()
counts = result.get_counts(qc)

print(counts)`;

const CPP_TEMPLATE = `#include <iostream>
#include <vector>
#include <cmath>
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

const GATE_NAMES = {
    'H': 'Hadamard',
    'X': 'Pauli-X',
    'Y': 'Pauli-Y',
    'Z': 'Pauli-Z',
    'S': 'S Gate',
    'T': 'T Gate',
    'CNOT': 'CNOT',
    'SWAP': 'SWAP',
    'Measure': 'Measure'
};

// Initialize drag-drop functionality
function initializeDragDrop() {
    const blockItems = document.querySelectorAll('.block-item');
    const workspaceArea = document.getElementById('workspaceArea');

    // Drag start from palette
    blockItems.forEach(item => {
        item.addEventListener('dragstart', handleDragStart);
    });

    // Drag over workspace
    workspaceArea.addEventListener('dragover', handleDragOver);
    workspaceArea.addEventListener('dragleave', handleDragLeave);
    workspaceArea.addEventListener('drop', handleDrop);
}

function handleDragStart(e) {
    draggedElement = e.target.closest('.block-item');
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('gate', draggedElement.dataset.gate);
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    e.currentTarget.classList.add('dragover');
}

function handleDragLeave(e) {
    e.currentTarget.classList.remove('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
    
    const gate = e.dataTransfer.getData('gate');
    if (gate) {
        addGateToCircuit(gate);
    }
}

function addGateToCircuit(gate) {
    circuitGates.push(gate);
    
    const workspaceArea = document.getElementById('workspaceArea');
    
    if (workspaceArea.querySelector('.workspace-empty')) {
        workspaceArea.innerHTML = '';
    }

    const gateBlock = document.createElement('div');
    gateBlock.className = 'gate-block';
    gateBlock.innerHTML = `
        ${GATE_NAMES[gate] || gate}
        <button class="remove-btn">✕</button>
    `;

    const removeBtn = gateBlock.querySelector('.remove-btn');
    removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const index = Array.from(workspaceArea.children).indexOf(gateBlock);
        circuitGates.splice(index, 1);
        gateBlock.remove();
        
        if (circuitGates.length === 0) {
            workspaceArea.innerHTML = '<div class="workspace-empty">Drop gates here</div>';
        }
    });

    workspaceArea.appendChild(gateBlock);
    updateCodeDisplay();
}

function updateCodeDisplay() {
    const pythonCode = generatePythonCode();
    const cppCode = generateCppCode();

    const codeDisplay = document.getElementById('codeDisplay');
    const activeLang = document.querySelector('.tab-btn.active').dataset.lang;

    if (activeLang === 'python') {
        codeDisplay.textContent = pythonCode;
    } else {
        codeDisplay.textContent = cppCode;
    }
}

function generatePythonCode() {
    let gatesCode = '';
    let qubit = 0;

    circuitGates.forEach((gate, idx) => {
        switch(gate) {
            case 'H':
                gatesCode += `    qc.h(qr[${qubit}])  # Hadamard on qubit ${qubit}\n`;
                break;
            case 'X':
                gatesCode += `    qc.x(qr[${qubit}])  # Pauli-X on qubit ${qubit}\n`;
                break;
            case 'Y':
                gatesCode += `    qc.y(qr[${qubit}])  # Pauli-Y on qubit ${qubit}\n`;
                break;
            case 'Z':
                gatesCode += `    qc.z(qr[${qubit}])  # Pauli-Z on qubit ${qubit}\n`;
                break;
            case 'S':
                gatesCode += `    qc.s(qr[${qubit}])  # S gate on qubit ${qubit}\n`;
                break;
            case 'T':
                gatesCode += `    qc.t(qr[${qubit}])  # T gate on qubit ${qubit}\n`;
                break;
            case 'CNOT':
                gatesCode += `    qc.cx(qr[0], qr[1])  # CNOT: control=0, target=1\n`;
                break;
            case 'SWAP':
                gatesCode += `    qc.swap(qr[0], qr[1])  # SWAP qubits 0 and 1\n`;
                break;
            case 'Measure':
                gatesCode += `    qc.measure(qr, cr)  # Measure all qubits\n`;
                break;
        }
    });

    return PYTHON_TEMPLATE.replace('{{GATES}}', gatesCode || '    # Add gates here');
}

function generateCppCode() {
    let gatesCode = '';

    circuitGates.forEach((gate, idx) => {
        switch(gate) {
            case 'H':
                gatesCode += `    qc.apply_hadamard(0);  // Hadamard\n`;
                break;
            case 'X':
                gatesCode += `    qc.apply_pauli_x(0);   // Pauli-X\n`;
                break;
            case 'Y':
                gatesCode += `    qc.apply_pauli_y(0);   // Pauli-Y\n`;
                break;
            case 'Z':
                gatesCode += `    qc.apply_pauli_z(0);   // Pauli-Z\n`;
                break;
            case 'S':
                gatesCode += `    qc.apply_s_gate(0);    // S Gate\n`;
                break;
            case 'T':
                gatesCode += `    qc.apply_t_gate(0);    // T Gate\n`;
                break;
            case 'CNOT':
                gatesCode += `    qc.apply_cnot(0, 1);   // CNOT\n`;
                break;
            case 'SWAP':
                gatesCode += `    qc.apply_swap(0, 1);   // SWAP\n`;
                break;
            case 'Measure':
                gatesCode += `    qc.measure();           // Measurement\n`;
                break;
        }
    });

    return CPP_TEMPLATE.replace('{{GATES}}', gatesCode || '    // Add gates here');
}

function simulateExecution() {
    const resultsContainer = document.getElementById('resultsContainer');
    
    if (circuitGates.length === 0) {
        resultsContainer.innerHTML = '<p>❌ Please add gates to your circuit first!</p>';
        return;
    }

    // Simulate quantum measurement outcomes
    const outcomes = generateOutcomes();
    let resultsHTML = '<p><strong>📊 Measurement Results (1000 shots):</strong></p>';
    resultsHTML += '<table style="width:100%; margin-top:10px;">';
    resultsHTML += '<tr><th>State</th><th>Count</th><th>Probability</th></tr>';

    for (const [state, count] of Object.entries(outcomes)) {
        const probability = ((count / 1000) * 100).toFixed(2);
        resultsHTML += `<tr><td>|${state}⟩</td><td>${count}</td><td>${probability}%</td></tr>`;
    }

    resultsHTML += '</table>';
    resultsHTML += `<p style="margin-top:15px;"><strong>⏱️ Execution Time:</strong> ${Math.random() * 50 + 25}.${Math.floor(Math.random() * 100)} ms</p>`;
    resultsHTML += `<p><strong>✅ Gates Applied:</strong> ${circuitGates.length}</p>`;

    resultsContainer.innerHTML = resultsHTML;
}

function generateOutcomes() {
    // Simple simulation for demonstration
    const numStates = 2 ** 2;  // 2 qubits
    const outcomes = {};
    
    for (let i = 0; i < numStates; i++) {
        const state = i.toString(2).padStart(2, '0');
        outcomes[state] = Math.floor(Math.random() * 500) + 100;
    }

    // Normalize to 1000 shots
    const total = Object.values(outcomes).reduce((a, b) => a + b, 0);
    for (const state in outcomes) {
        outcomes[state] = Math.round((outcomes[state] / total) * 1000);
    }

    return outcomes;
}

function clearCircuit() {
    circuitGates = [];
    const workspaceArea = document.getElementById('workspaceArea');
    workspaceArea.innerHTML = '<div class="workspace-empty">Drop gates here</div>';
    document.getElementById('resultsContainer').innerHTML = '<p>Circuit execution results will appear here</p>';
    updateCodeDisplay();
}

// Tab switching
function setupTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            updateCodeDisplay();
        });
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeDragDrop();
    setupTabs();

    document.getElementById('clearBtn').addEventListener('click', clearCircuit);
    document.getElementById('executeBtn').addEventListener('click', simulateExecution);

    // Set Python as default active tab
    document.querySelector('[data-lang="python"]').classList.add('active');
    updateCodeDisplay();
});
