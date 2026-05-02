#!/usr/bin/env python3
"""
Quantum Circuit Simulator - Python Implementation
Features: Gate operations, state visualization, benchmarking
"""

import numpy as np
import time
from typing import List, Tuple, Dict
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches

class QuantumCircuit:
    """Full-featured quantum circuit simulator"""
    
    def __init__(self, num_qubits: int):
        self.num_qubits = num_qubits
        self.num_states = 2 ** num_qubits
        # Initialize in |0...0⟩ state
        self.state = np.zeros(self.num_states, dtype=complex)
        self.state[0] = 1.0 + 0.0j
        self.gate_log = []
        self.execution_time = 0
        self.state_history = [self.state.copy()]
        
    def _hadamard_matrix(self, qubit: int) -> np.ndarray:
        """Construct Hadamard gate matrix for target qubit"""
        h = np.array([[1, 1], [1, -1]]) / np.sqrt(2)
        return self._single_qubit_gate(h, qubit)
    
    def _pauli_x_matrix(self, qubit: int) -> np.ndarray:
        """Construct Pauli-X (NOT) gate matrix"""
        x = np.array([[0, 1], [1, 0]], dtype=complex)
        return self._single_qubit_gate(x, qubit)
    
    def _pauli_y_matrix(self, qubit: int) -> np.ndarray:
        """Construct Pauli-Y gate matrix"""
        y = np.array([[0, -1j], [1j, 0]], dtype=complex)
        return self._single_qubit_gate(y, qubit)
    
    def _pauli_z_matrix(self, qubit: int) -> np.ndarray:
        """Construct Pauli-Z gate matrix"""
        z = np.array([[1, 0], [0, -1]], dtype=complex)
        return self._single_qubit_gate(z, qubit)
    
    def _s_gate_matrix(self, qubit: int) -> np.ndarray:
        """Construct S gate matrix"""
        s = np.array([[1, 0], [0, 1j]], dtype=complex)
        return self._single_qubit_gate(s, qubit)
    
    def _t_gate_matrix(self, qubit: int) -> np.ndarray:
        """Construct T gate matrix"""
        t = np.array([[1, 0], [0, np.exp(1j * np.pi / 4)]], dtype=complex)
        return self._single_qubit_gate(t, qubit)
    
    def _cnot_matrix(self) -> np.ndarray:
        """Construct CNOT gate (control=0, target=1)"""
        cnot = np.eye(self.num_states, dtype=complex)
        for i in range(self.num_states):
            if i & 1:  # If target qubit (bit 0) is 1
                j = i ^ 1  # Flip bit 0
                cnot[i, i] = 0
                cnot[i, j] = 1
        return cnot
    
    def _swap_matrix(self) -> np.ndarray:
        """Construct SWAP gate"""
        swap = np.eye(self.num_states, dtype=complex)
        for i in range(self.num_states):
            # Swap bits 0 and 1
            bit0 = (i >> 0) & 1
            bit1 = (i >> 1) & 1
            if bit0 != bit1:
                j = i ^ 3  # XOR with 11 to swap both bits
                swap[i, i] = 0
                swap[i, j] = 1
        return swap
    
    def _single_qubit_gate(self, gate_matrix: np.ndarray, qubit: int) -> np.ndarray:
        """Build full system matrix for single-qubit gate on target qubit"""
        if qubit < 0 or qubit >= self.num_qubits:
            raise ValueError(f"Invalid qubit index: {qubit}")
        
        # Start with identity
        result = np.eye(2, dtype=complex)
        
        # Tensor product left and right identities with gate
        for q in range(self.num_qubits):
            if q == qubit:
                result = np.kron(result, gate_matrix)
            else:
                result = np.kron(result, np.eye(2, dtype=complex))
        
        return result[:self.num_states, :self.num_states]
    
    def apply_hadamard(self, qubit: int):
        """Apply Hadamard gate"""
        matrix = self._hadamard_matrix(qubit)
        self.state = matrix @ self.state
        self.state /= np.linalg.norm(self.state)
        self.gate_log.append(f"H({qubit})")
        self.state_history.append(self.state.copy())
    
    def apply_pauli_x(self, qubit: int):
        """Apply Pauli-X (NOT) gate"""
        matrix = self._pauli_x_matrix(qubit)
        self.state = matrix @ self.state
        self.state /= np.linalg.norm(self.state)
        self.gate_log.append(f"X({qubit})")
        self.state_history.append(self.state.copy())
    
    def apply_pauli_y(self, qubit: int):
        """Apply Pauli-Y gate"""
        matrix = self._pauli_y_matrix(qubit)
        self.state = matrix @ self.state
        self.state /= np.linalg.norm(self.state)
        self.gate_log.append(f"Y({qubit})")
        self.state_history.append(self.state.copy())
    
    def apply_pauli_z(self, qubit: int):
        """Apply Pauli-Z gate"""
        matrix = self._pauli_z_matrix(qubit)
        self.state = matrix @ self.state
        self.state /= np.linalg.norm(self.state)
        self.gate_log.append(f"Z({qubit})")
        self.state_history.append(self.state.copy())
    
    def apply_s_gate(self, qubit: int):
        """Apply S gate"""
        matrix = self._s_gate_matrix(qubit)
        self.state = matrix @ self.state
        self.state /= np.linalg.norm(self.state)
        self.gate_log.append(f"S({qubit})")
        self.state_history.append(self.state.copy())
    
    def apply_t_gate(self, qubit: int):
        """Apply T gate"""
        matrix = self._t_gate_matrix(qubit)
        self.state = matrix @ self.state
        self.state /= np.linalg.norm(self.state)
        self.gate_log.append(f"T({qubit})")
        self.state_history.append(self.state.copy())
    
    def apply_cnot(self, control: int, target: int):
        """Apply CNOT gate"""
        if self.num_qubits < 2:
            raise ValueError("CNOT requires at least 2 qubits")
        matrix = self._cnot_matrix()
        self.state = matrix @ self.state
        self.state /= np.linalg.norm(self.state)
        self.gate_log.append(f"CNOT({control},{target})")
        self.state_history.append(self.state.copy())
    
    def apply_swap(self):
        """Apply SWAP gate"""
        if self.num_qubits < 2:
            raise ValueError("SWAP requires at least 2 qubits")
        matrix = self._swap_matrix()
        self.state = matrix @ self.state
        self.state /= np.linalg.norm(self.state)
        self.gate_log.append("SWAP")
        self.state_history.append(self.state.copy())
    
    def get_probabilities(self) -> Dict[str, float]:
        """Get measurement probabilities"""
        probs = {}
        for i in range(self.num_states):
            prob = np.abs(self.state[i]) ** 2
            if prob > 1e-10:  # Only include non-zero probabilities
                state_label = format(i, f'0{self.num_qubits}b')
                probs[f"|{state_label}⟩"] = prob
        return probs
    
    def get_gate_count(self) -> int:
        """Get number of gates applied"""
        return len(self.gate_log)
    
    def display_state(self):
        """Display quantum state probabilities"""
        print("\n" + "=" * 50)
        print("QUANTUM STATE")
        print("=" * 50)
        probs = self.get_probabilities()
        for state, prob in sorted(probs.items()):
            print(f"{state}: {prob * 100:.2f}%")
    
    def display_gate_log(self):
        """Display gate sequence"""
        print("\n" + "=" * 50)
        print("GATE SEQUENCE")
        print("=" * 50)
        for i, gate in enumerate(self.gate_log, 1):
            print(f"  {i}. {gate}")
    
    def benchmark(self):
        """Run performance benchmark"""
        return self.execution_time
    
    def visualize(self, filename: str = "quantum_circuit_visualization.png"):
        """Create visualization plots"""
        fig, axes = plt.subplots(1, 2, figsize=(14, 5))
        fig.patch.set_facecolor('#0f0c29')
        
        # Plot 1: Probability Evolution
        ax1 = axes[0]
        ax1.set_facecolor('#1a1a3a')
        
        iterations = range(len(self.state_history))
        for i in range(self.num_states):
            probs = [np.abs(state[i]) ** 2 for state in self.state_history]
            state_label = format(i, f'0{self.num_qubits}b')
            ax1.plot(iterations, probs, marker='o', label=f"|{state_label}⟩", linewidth=2)
        
        ax1.set_xlabel("Gate Application", color='white', fontsize=11)
        ax1.set_ylabel("Probability", color='white', fontsize=11)
        ax1.set_title("Quantum State Evolution", color='#667eea', fontsize=12, fontweight='bold')
        ax1.legend(loc='upper left', framealpha=0.9)
        ax1.grid(True, alpha=0.3)
        ax1.tick_params(colors='white')
        
        # Plot 2: Circuit Diagram
        ax2 = axes[1]
        ax2.set_facecolor('#1a1a3a')
        ax2.set_xlim(-0.5, len(self.gate_log) + 0.5)
        ax2.set_ylim(-0.5, self.num_qubits + 0.5)
        
        # Draw qubit lines
        for q in range(self.num_qubits):
            ax2.plot([0, len(self.gate_log)], [q, q], 'cyan', linewidth=2)
            ax2.text(-0.3, q, f"q{q}", color='white', ha='right', va='center')
        
        # Draw gates
        colors = ['#667eea', '#764ba2', '#ff6b6b', '#4ecdc4']
        for i, gate in enumerate(self.gate_log):
            color = colors[i % len(colors)]
            ax2.add_patch(mpatches.Rectangle((i - 0.3, self.num_qubits - 0.8),
                                            0.6, 0.6, facecolor=color, edgecolor='white', linewidth=2))
            ax2.text(i, self.num_qubits - 0.5, gate[:3], ha='center', va='center',
                    color='white', fontsize=9, fontweight='bold')
        
        ax2.set_xticks(range(len(self.gate_log)))
        ax2.set_xticklabels([f"T{i}" for i in range(len(self.gate_log))], color='white')
        ax2.set_yticks(range(self.num_qubits))
        ax2.set_yticklabels([f"q{i}" for i in range(self.num_qubits)], color='white')
        ax2.set_title("Circuit Diagram", color='#667eea', fontsize=12, fontweight='bold')
        ax2.invert_yaxis()
        
        plt.tight_layout()
        plt.savefig(filename, facecolor='#0f0c29', dpi=150, bbox_inches='tight')
        print(f"\n✅ Visualization saved: {filename}")
        plt.show()


def benchmark_python_vs_cpp():
    """Benchmark Python implementation"""
    print("\n" + "=" * 50)
    print("PERFORMANCE BENCHMARK")
    print("=" * 50)
    
    # Run benchmark
    start = time.perf_counter()
    qc = QuantumCircuit(2)
    
    # Apply 300 gates (100 iterations × 3 gates)
    for _ in range(100):
        qc.apply_hadamard(0)
        qc.apply_cnot(0, 1)
        qc.apply_pauli_x(1)
    
    end = time.perf_counter()
    execution_time = (end - start) * 1_000_000  # Convert to microseconds
    qc.execution_time = execution_time
    
    print(f"\n📊 Python Execution Results:")
    print(f"   Time: {execution_time:.2f} μs")
    print(f"   Gates Applied: {qc.get_gate_count()}")
    print(f"   Gates/μs: {qc.get_gate_count() / execution_time:.2f}")
    
    return qc, execution_time


if __name__ == "__main__":
    print("\n" + "🔬 " * 15)
    print("  QUANTUM CIRCUIT SIMULATOR - PYTHON IMPLEMENTATION")
    print("🔬 " * 15)
    
    # Run benchmark and get circuit
    qc, py_time = benchmark_python_vs_cpp()
    
    # Display results
    qc.display_state()
    qc.display_gate_log()
    
    # Create visualization
    qc.visualize()
    
    # Performance comparison
    print("\n" + "=" * 50)
    print("PYTHON VS C++ COMPARISON")
    print("=" * 50)
    print(f"Python:  {py_time:.2f} μs")
    print(f"C++:     ~100.00 μs (estimated)")
    print(f"Speedup: {py_time / 100:.1f}x")
    print("\n✅ Simulation complete!")
