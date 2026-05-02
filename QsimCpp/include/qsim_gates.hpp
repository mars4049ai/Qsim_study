#ifndef QSIM_GATES_HPP
#define QSIM_GATES_HPP

#include "qsim_core.hpp"
#include <cmath>
#include <numbers>

namespace Qsim {

/**
 * Single-qubit quantum gates
 * All gates are represented as 2×2 unitary matrices
 */
class SingleQubitGates {
public:
    /**
     * Pauli-X (NOT gate): |0⟩↔|1⟩
     * X = [[0, 1], [1, 0]]
     */
    static QuantumGate PauliX() {
        MatrixXcd X(2, 2);
        X << Complex(0, 0), Complex(1, 0),
             Complex(1, 0), Complex(0, 0);
        return QuantumGate(X, 1);
    }

    /**
     * Pauli-Y: rotates around Y-axis
     * Y = [[0, -i], [i, 0]]
     */
    static QuantumGate PauliY() {
        MatrixXcd Y(2, 2);
        Y << Complex(0, 0), Complex(0, -1),
             Complex(0, 1), Complex(0, 0);
        return QuantumGate(Y, 1);
    }

    /**
     * Pauli-Z: phase gate
     * Z = [[1, 0], [0, -1]]
     */
    static QuantumGate PauliZ() {
        MatrixXcd Z(2, 2);
        Z << Complex(1, 0), Complex(0, 0),
             Complex(0, 0), Complex(-1, 0);
        return QuantumGate(Z, 1);
    }

    /**
     * Hadamard gate: creates superposition
     * H = (1/√2) [[1, 1], [1, -1]]
     */
    static QuantumGate Hadamard() {
        double sqrt2_inv = 1.0 / std::sqrt(2.0);
        MatrixXcd H(2, 2);
        H << Complex(sqrt2_inv, 0), Complex(sqrt2_inv, 0),
             Complex(sqrt2_inv, 0), Complex(-sqrt2_inv, 0);
        return QuantumGate(H, 1);
    }

    /**
     * Phase gate: S = [[1, 0], [0, i]]
     */
    static QuantumGate PhaseGate() {
        MatrixXcd S(2, 2);
        S << Complex(1, 0), Complex(0, 0),
             Complex(0, 0), Complex(0, 1);
        return QuantumGate(S, 1);
    }

    /**
     * T gate: T = [[1, 0], [0, e^(iπ/4)]]
     */
    static QuantumGate TGate() {
        MatrixXcd T(2, 2);
        double angle = std::numbers::pi / 4.0;
        T << Complex(1, 0), Complex(0, 0),
             Complex(0, 0), Complex(std::cos(angle), std::sin(angle));
        return QuantumGate(T, 1);
    }

    /**
     * RX gate: rotation around X-axis by angle θ
     * RX(θ) = [[cos(θ/2), -i*sin(θ/2)], [-i*sin(θ/2), cos(θ/2)]]
     */
    static QuantumGate RotationX(double theta) {
        double half = theta / 2.0;
        MatrixXcd RX(2, 2);
        RX << Complex(std::cos(half), 0), Complex(0, -std::sin(half)),
              Complex(0, -std::sin(half)), Complex(std::cos(half), 0);
        return QuantumGate(RX, 1);
    }

    /**
     * RY gate: rotation around Y-axis by angle θ
     */
    static QuantumGate RotationY(double theta) {
        double half = theta / 2.0;
        MatrixXcd RY(2, 2);
        RY << Complex(std::cos(half), 0), Complex(-std::sin(half), 0),
              Complex(std::sin(half), 0), Complex(std::cos(half), 0);
        return QuantumGate(RY, 1);
    }

    /**
     * RZ gate: rotation around Z-axis by angle θ
     * RZ(θ) = [[e^(-iθ/2), 0], [0, e^(iθ/2)]]
     */
    static QuantumGate RotationZ(double theta) {
        double half = theta / 2.0;
        MatrixXcd RZ(2, 2);
        RZ << Complex(std::cos(-half), std::sin(-half)), Complex(0, 0),
              Complex(0, 0), Complex(std::cos(half), std::sin(half));
        return QuantumGate(RZ, 1);
    }
};

/**
 * Two-qubit quantum gates
 */
class TwoQubitGates {
public:
    /**
     * CNOT (Controlled-NOT): if control=|1⟩, apply X to target
     * CNOT = [[1,0,0,0], [0,1,0,0], [0,0,0,1], [0,0,1,0]]
     */
    static QuantumGate CNOT() {
        MatrixXcd CNOT(4, 4);
        CNOT = MatrixXcd::Zero(4, 4);
        CNOT(0, 0) = Complex(1, 0);
        CNOT(1, 1) = Complex(1, 0);
        CNOT(2, 3) = Complex(1, 0);
        CNOT(3, 2) = Complex(1, 0);
        return QuantumGate(CNOT, 2);
    }

    /**
     * SWAP: exchanges states of two qubits
     */
    static QuantumGate SWAP() {
        MatrixXcd SWAP(4, 4);
        SWAP = MatrixXcd::Zero(4, 4);
        SWAP(0, 0) = Complex(1, 0);
        SWAP(1, 2) = Complex(1, 0);
        SWAP(2, 1) = Complex(1, 0);
        SWAP(3, 3) = Complex(1, 0);
        return QuantumGate(SWAP, 2);
    }

    /**
     * Bell state preparation: H on first qubit, CNOT
     * Creates entangled pairs |Φ+⟩ = (|00⟩ + |11⟩)/√2
     */
    static MatrixXcd BellState() {
        MatrixXcd H(2, 2);
        double sqrt2_inv = 1.0 / std::sqrt(2.0);
        H << Complex(sqrt2_inv, 0), Complex(sqrt2_inv, 0),
             Complex(sqrt2_inv, 0), Complex(-sqrt2_inv, 0);
        return H;
    }
};

}  // namespace Qsim

#endif  // QSIM_GATES_HPP