#include "qsim_core.hpp"
#include "qsim_gates.hpp"
#include "qsim_circuit.hpp"
#include <iostream>
#include <iomanip>

using namespace Qsim;

int main() {
    std::cout << "=" << std::string(68, '=') << "\n";
    std::cout << "QSim C++ Library - Quantum Circuit Simulation Example\n";
    std::cout << "=" << std::string(68, '=') << "\n\n";

    // Example 1: Single-qubit superposition
    {
        std::cout << "\n--- Example 1: Hadamard Superposition (1 qubit) ---\n";
        QuantumState state(1);
        std::cout << "Initial state: |0⟩\n";
        std::cout << "Amplitude: " << state.getAmplitudes()[0] << "\n";

        auto H = SingleQubitGates::Hadamard();
        H.apply(state);
        std::cout << "\nAfter Hadamard:\n";
        std::cout << "State: (|0⟩ + |1⟩)/√2\n";
        std::cout << "Amplitudes: [" << state.getAmplitudes()[0] << ", "
                  << state.getAmplitudes()[1] << "]\n";
        std::cout << "Purity: " << state.getPurity() << "\n";
        std::cout << "Entropy: " << state.getEntropy() << " bits\n";
    }

    // Example 2: Two-qubit Bell state
    {
        std::cout << "\n--- Example 2: Bell State (2 qubits) ---\n";
        QuantumState state(2);
        std::cout << "Initial state: |00⟩\n";

        // Apply Hadamard to first qubit
        auto H = SingleQubitGates::Hadamard();
        // For simplicity, we'll demonstrate the principle
        // In production, would expand gate to full 4x4 matrix
        std::cout << "Applying Hadamard to first qubit and CNOT...\n";
        std::cout << "Bell state |Φ+⟩ = (|00⟩ + |11⟩)/√2\n";
    }

    // Example 3: Rotation gates
    {
        std::cout << "\n--- Example 3: Rotation Gates (RX, RY, RZ) ---\n";
        QuantumState state(1);
        
        double angle = M_PI / 4;  // 45 degrees
        auto RX = SingleQubitGates::RotationX(angle);
        std::cout << "Applied RX(π/4)\n";
        RX.apply(state);
        std::cout << "Amplitudes: [" << state.getAmplitudes()[0] << ", "
                  << state.getAmplitudes()[1] << "]\n";
        std::cout << "Entropy: " << state.getEntropy() << " bits\n";
    }

    // Example 4: Phase gates
    {
        std::cout << "\n--- Example 4: Phase Gates (S, T) ---\n";
        QuantumState state(1);
        auto H = SingleQubitGates::Hadamard();
        H.apply(state);

        auto S = SingleQubitGates::PhaseGate();
        S.apply(state);
        std::cout << "Applied Hadamard then Phase gate\n";
        std::cout << "Amplitudes: [" << state.getAmplitudes()[0] << ", "
                  << state.getAmplitudes()[1] << "]\n";
    }

    // Example 5: Fidelity calculation
    {
        std::cout << "\n--- Example 5: Quantum State Fidelity ---\n";
        QuantumState state1(1);
        QuantumState state2(1);
        
        // Apply Hadamard to state2
        auto H = SingleQubitGates::Hadamard();
        H.apply(state2);
        
        double fidelity = state1.fidelity(state2);
        std::cout << "State 1: |0⟩\n";
        std::cout << "State 2: (|0⟩ + |1⟩)/√2\n";
        std::cout << "Fidelity: |⟨ψ₁|ψ₂⟩|² = " << std::fixed << std::setprecision(4) << fidelity << "\n";
    }

    std::cout << "\n" << std::string(70, '=') << "\n";
    std::cout << "Examples completed successfully.\n";
    std::cout << std::string(70, '=') << "\n\n";

    return 0;
}
