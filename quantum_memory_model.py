"""
Quantum Memory Model: Optical Closed-Loop System with Signal Delay
===================================================================

This module implements a visual model of a quantum memory system consisting of:
1. Signal Sending Node: Prepares quantum state
2. Optical Closed-Loop System with Cell: Storage and delay mechanism
3. Signal Output: Retrieves quantum state

Based on quantum information theory for photonic quantum memory.
"""

import numpy as np
from dataclasses import dataclass
from typing import Tuple, List
import json


@dataclass
class QuantumState:
    """Represents a quantum state in the memory system."""
    amplitudes: np.ndarray  # Complex amplitudes for basis states
    num_qubits: int
    
    def normalize(self):
        """Normalize the quantum state."""
        norm = np.sqrt(np.sum(np.abs(self.amplitudes) ** 2))
        if norm > 0:
            self.amplitudes = self.amplitudes / norm
    
    def to_dict(self):
        """Convert to dictionary for serialization."""
        return {
            'amplitudes': self.amplitudes.tolist(),
            'num_qubits': self.num_qubits
        }


class SignalSendingNode:
    """
    Prepares and sends quantum signals into the memory system.
    Models optical quantum state preparation.
    """
    
    def __init__(self, num_qubits: int = 1):
        self.num_qubits = num_qubits
        self.state_dim = 2 ** num_qubits
    
    def prepare_basis_state(self, state_index: int) -> QuantumState:
        """Prepare a computational basis state |state_index>."""
        amplitudes = np.zeros(self.state_dim, dtype=complex)
        amplitudes[state_index] = 1.0
        return QuantumState(amplitudes, self.num_qubits)
    
    def prepare_superposition(self) -> QuantumState:
        """Prepare an equal superposition state."""
        amplitudes = np.ones(self.state_dim, dtype=complex) / np.sqrt(self.state_dim)
        state = QuantumState(amplitudes, self.num_qubits)
        state.normalize()
        return state
    
    def prepare_bell_state(self, index: int = 0) -> QuantumState:
        """Prepare Bell states for 2 qubits."""
        if self.num_qubits != 2:
            raise ValueError("Bell states require 2 qubits")
        
        bell_states = [
            np.array([1, 0, 0, 1], dtype=complex) / np.sqrt(2),  # |Φ+>
            np.array([1, 0, 0, -1], dtype=complex) / np.sqrt(2),  # |Ψ+>
            np.array([0, 1, 1, 0], dtype=complex) / np.sqrt(2),  # |Φ->
            np.array([0, 1, -1, 0], dtype=complex) / np.sqrt(2),  # |Ψ->
        ]
        
        amplitudes = bell_states[index % 4]
        return QuantumState(amplitudes, self.num_qubits)
    
    def apply_hadamard(self, state: QuantumState) -> QuantumState:
        """Apply Hadamard gate to first qubit."""
        H = np.array([[1, 1], [1, -1]], dtype=complex) / np.sqrt(2)
        
        # Build full Hadamard operator for first qubit
        full_H = H
        for _ in range(self.num_qubits - 1):
            full_H = np.kron(full_H, np.eye(2))
        
        new_amplitudes = full_H @ state.amplitudes
        new_state = QuantumState(new_amplitudes, self.num_qubits)
        new_state.normalize()
        return new_state
    
    def apply_phase_shift(self, state: QuantumState, phase: float) -> QuantumState:
        """Apply phase shift gate."""
        phase_gate = np.array([[1, 0], [0, np.exp(1j * phase)]], dtype=complex)
        
        full_gate = phase_gate
        for _ in range(self.num_qubits - 1):
            full_gate = np.kron(full_gate, np.eye(2))
        
        new_amplitudes = full_gate @ state.amplitudes
        new_state = QuantumState(new_amplitudes, self.num_qubits)
        new_state.normalize()
        return new_state


class OpticalClosedLoopCell:
    """
    Represents the optical closed-loop system with quantum memory cell.
    Models:
    - Photonic quantum memory storage
    - Delay line with reflective elements
    - Coherence preservation
    """
    
    def __init__(self, num_qubits: int = 1, cavity_length: float = 1.0, 
                 reflectivity: float = 0.95):
        self.num_qubits = num_qubits
        self.state_dim = 2 ** num_qubits
        self.cavity_length = cavity_length
        self.reflectivity = reflectivity
        
        # Photon lifetime in cavity (ns)
        self.photon_lifetime = cavity_length / 3e8 * 1e9
        
        # Storage history
        self.storage_history: List[Tuple[float, QuantumState]] = []
        self.current_state = None
    
    def store_state(self, state: QuantumState, timestamp: float = 0.0):
        """Store quantum state in the memory cell."""
        # Simulate decoherence during storage
        decoherence_factor = np.exp(-timestamp / (2 * self.photon_lifetime))
        
        # Apply decoherence to amplitudes
        decohered_amplitudes = state.amplitudes * decoherence_factor
        stored_state = QuantumState(decohered_amplitudes, self.num_qubits)
        stored_state.normalize()
        
        self.current_state = stored_state
        self.storage_history.append((timestamp, stored_state))
        
        return stored_state
    
    def apply_loop_delay(self, state: QuantumState, num_loops: int = 1) -> QuantumState:
        """
        Apply multiple round-trips through the closed-loop system.
        Each round-trip applies:
        - Reflectivity loss
        - Phase accumulation
        - Coherence degradation
        """
        current_state = state.amplitudes.copy()
        
        for loop in range(num_loops):
            # Apply reflectivity loss
            amplitude_loss = np.sqrt(self.reflectivity)
            current_state = current_state * amplitude_loss
            
            # Apply phase shift per round-trip
            phase_shift = 2 * np.pi * loop / num_loops
            phase_gate = np.diag(np.exp(1j * phase_shift * np.arange(self.state_dim)))
            current_state = phase_gate @ current_state
        
        result_state = QuantumState(current_state, self.num_qubits)
        result_state.normalize()
        return result_state
    
    def get_storage_fidelity(self, original_state: QuantumState) -> float:
        """
        Calculate fidelity between original and stored state.
        Fidelity = |<ψ_original|ψ_stored>|²
        """
        if self.current_state is None:
            return 0.0
        
        overlap = np.abs(np.vdot(original_state.amplitudes, 
                                  self.current_state.amplitudes)) ** 2
        return float(overlap)
    
    def reset(self):
        """Clear the memory cell."""
        self.current_state = None
        self.storage_history.clear()


class SignalOutput:
    """
    Retrieves and measures quantum states from the memory cell.
    Provides readout and measurement operations.
    """
    
    def __init__(self, num_qubits: int = 1):
        self.num_qubits = num_qubits
        self.state_dim = 2 ** num_qubits
        self.measurement_results = []
    
    def measure_computational_basis(self, state: QuantumState) -> int:
        """
        Measure state in computational basis |0>, |1>, ...
        Returns the measured state index.
        """
        probabilities = np.abs(state.amplitudes) ** 2
        measured_state = np.random.choice(self.state_dim, p=probabilities)
        
        self.measurement_results.append({
            'basis': 'computational',
            'result': measured_state,
            'probabilities': probabilities.tolist()
        })
        
        return int(measured_state)
    
    def measure_hadamard_basis(self, state: QuantumState) -> int:
        """
        Measure state in Hadamard basis.
        """
        # Apply inverse Hadamard before measurement
        H = np.array([[1, 1], [1, -1]], dtype=complex) / np.sqrt(2)
        
        full_H = H
        for _ in range(self.num_qubits - 1):
            full_H = np.kron(full_H, np.eye(2))
        
        rotated_amplitudes = full_H @ state.amplitudes
        probabilities = np.abs(rotated_amplitudes) ** 2
        measured_state = np.random.choice(self.state_dim, p=probabilities)
        
        self.measurement_results.append({
            'basis': 'hadamard',
            'result': measured_state,
            'probabilities': probabilities.tolist()
        })
        
        return int(measured_state)
    
    def get_state_tomography(self, state: QuantumState) -> dict:
        """
        Perform quantum state tomography.
        Returns density matrix representation.
        """
        # Create density matrix ρ = |ψ><ψ|
        psi = state.amplitudes.reshape(-1, 1)
        rho = psi @ psi.conj().T
        
        return {
            'density_matrix': rho.tolist(),
            'purity': float(np.real(np.trace(rho @ rho))),
            'entropy': float(self._von_neumann_entropy(rho))
        }
    
    def _von_neumann_entropy(self, rho: np.ndarray) -> float:
        """Calculate von Neumann entropy of density matrix."""
        eigenvalues = np.linalg.eigvalsh(rho)
        eigenvalues = eigenvalues[eigenvalues > 1e-10]  # Filter out zero eigenvalues
        entropy = -np.sum(eigenvalues * np.log2(eigenvalues))
        return float(entropy)


class QuantumMemorySystem:
    """
    Complete quantum memory system integrating all components:
    Signal Sending Node → Optical Closed-Loop Cell → Signal Output
    """
    
    def __init__(self, num_qubits: int = 1, cavity_length: float = 1.0):
        self.num_qubits = num_qubits
        self.sender = SignalSendingNode(num_qubits)
        self.memory_cell = OpticalClosedLoopCell(num_qubits, cavity_length)
        self.output = SignalOutput(num_qubits)
    
    def store_and_retrieve(self, initial_state: QuantumState, 
                          num_loops: int = 1) -> Tuple[QuantumState, dict]:
        """
        Complete cycle: store quantum state and retrieve it.
        Returns: (retrieved_state, metrics)
        """
        # Store state
        stored = self.memory_cell.store_state(initial_state)
        
        # Apply loop delays
        delayed = self.memory_cell.apply_loop_delay(stored, num_loops)
        
        # Measure and characterize output
        tomography = self.output.get_state_tomography(delayed)
        fidelity = self.memory_cell.get_storage_fidelity(initial_state)
        
        metrics = {
            'fidelity': fidelity,
            'purity': tomography['purity'],
            'entropy': tomography['entropy'],
            'num_loops': num_loops,
            'photon_lifetime_ns': self.memory_cell.photon_lifetime
        }
        
        return delayed, metrics
    
    def simulate_sequence(self, state_sequence: List[QuantumState], 
                         delays: List[int]) -> List[dict]:
        """
        Simulate a sequence of quantum states through memory.
        """
        results = []
        
        for state, delay in zip(state_sequence, delays):
            retrieved, metrics = self.store_and_retrieve(state, delay)
            results.append(metrics)
        
        return results
    
    def export_metrics(self) -> dict:
        """Export all system metrics and history."""
        return {
            'num_qubits': self.num_qubits,
            'cavity_length': self.memory_cell.cavity_length,
            'reflectivity': self.memory_cell.reflectivity,
            'photon_lifetime_ns': self.memory_cell.photon_lifetime,
            'measurement_results': self.output.measurement_results,
            'storage_history': [
                {'timestamp': t, 'state': s.to_dict()} 
                for t, s in self.memory_cell.storage_history
            ]
        }


def demo():
    """Demonstrate quantum memory system."""
    print("=" * 70)
    print("QUANTUM MEMORY SYSTEM DEMONSTRATION")
    print("Signal Sending Node → Optical Closed-Loop Cell → Signal Output")
    print("=" * 70)
    
    # Create 2-qubit system
    system = QuantumMemorySystem(num_qubits=2, cavity_length=0.3)
    
    # Prepare Bell state |Φ+>
    print("\n1. SIGNAL SENDING NODE: Preparing Bell state |Φ+>")
    bell_state = system.sender.prepare_bell_state(0)
    print(f"   Initial state amplitudes: {bell_state.amplitudes}")
    
    # Store in memory cell
    print("\n2. OPTICAL CLOSED-LOOP CELL: Storing and applying delays")
    retrieved, metrics = system.store_and_retrieve(bell_state, num_loops=3)
    
    print(f"\n3. SIGNAL OUTPUT: Retrieved state metrics")
    print(f"   Fidelity: {metrics['fidelity']:.4f}")
    print(f"   Purity: {metrics['purity']:.4f}")
    print(f"   Entropy: {metrics['entropy']:.4f}")
    print(f"   Photon Lifetime: {metrics['photon_lifetime_ns']:.2f} ns")
    
    # Perform measurements
    print("\n4. MEASUREMENT RESULTS:")
    for i in range(5):
        result = system.output.measure_computational_basis(retrieved)
        print(f"   Shot {i+1}: Measured state {result}")
    
    # Export data
    print("\n5. SYSTEM DATA EXPORT:")
    metrics_export = system.export_metrics()
    print(f"   Stored states in history: {len(metrics_export['storage_history'])}")
    print(f"   Total measurements: {len(metrics_export['measurement_results'])}")
    
    print("\n" + "=" * 70)
    print("Demonstration complete.")
    print("=" * 70)


if __name__ == "__main__":
    demo()
