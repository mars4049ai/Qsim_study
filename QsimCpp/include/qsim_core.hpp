#ifndef QSIM_CORE_HPP
#define QSIM_CORE_HPP

#include <complex>
#include <vector>
#include <cmath>
#include <stdexcept>
#include <algorithm>
#include <Eigen/Dense>

namespace Qsim {

using Complex = std::complex<double>;
using namespace Eigen;

/**
 * QuantumState: Represents a quantum state vector with n qubits
 * Stores state as complex amplitudes: |ψ⟩ = Σ α_i |i⟩
 * Uses Eigen vectors for optimized linear algebra operations
 */
class QuantumState {
private:
    VectorXcd amplitudes;  // State vector (2^n elements)
    int num_qubits;
    double normalization_error;

public:
    /**
     * Construct quantum state for n qubits
     * Default: |0...0⟩ state
     */
    explicit QuantumState(int n_qubits = 1)
        : num_qubits(n_qubits), normalization_error(0.0) {
        if (n_qubits < 1 || n_qubits > 20) {
            throw std::invalid_argument("Number of qubits must be 1-20");
        }
        int dim = 1 << num_qubits;  // 2^n_qubits
        amplitudes = VectorXcd::Zero(dim);
        amplitudes(0) = 1.0;  // Start in |0⟩
    }

    /**
     * Construct from explicit amplitudes vector
     */
    QuantumState(int n_qubits, const VectorXcd& amps)
        : num_qubits(n_qubits), amplitudes(amps), normalization_error(0.0) {
        normalize();
    }

    // Getters
    int getNumQubits() const { return num_qubits; }
    int getDimension() const { return 1 << num_qubits; }
    const VectorXcd& getAmplitudes() const { return amplitudes; }
    VectorXcd& getAmplitudes() { return amplitudes; }
    double getNormalizationError() const { return normalization_error; }

    /**
     * Normalize state: |ψ⟩ / ||ψ⟩||
     * Ensures Σ|α_i|² = 1
     */
    void normalize() {
        double norm = amplitudes.norm();
        if (norm > 1e-10) {
            amplitudes /= norm;
            normalization_error = 0.0;
        } else {
            throw std::runtime_error("Cannot normalize zero state");
        }
    }

    /**
     * Check if state is properly normalized
     */
    bool isNormalized(double tolerance = 1e-10) const {
        double norm_sq = amplitudes.squaredNorm();
        return std::abs(norm_sq - 1.0) < tolerance;
    }

    /**
     * Get probability of measuring state |i⟩
     */
    double getProbability(int basis_state) const {
        if (basis_state < 0 || basis_state >= getDimension()) {
            throw std::out_of_range("Basis state index out of range");
        }
        return std::abs(amplitudes(basis_state)) * std::abs(amplitudes(basis_state));
    }

    /**
     * Get probability distribution over all basis states
     */
    std::vector<double> getProbabilityDistribution() const {
        std::vector<double> probs(getDimension());
        for (int i = 0; i < getDimension(); ++i) {
            probs[i] = getProbability(i);
        }
        return probs;
    }

    /**
     * Calculate state fidelity: |⟨ψ|φ⟩|²
     */
    double fidelity(const QuantumState& other) const {
        if (num_qubits != other.num_qubits) {
            throw std::invalid_argument("States must have same number of qubits");
        }
        Complex overlap = amplitudes.dot(other.amplitudes);
        return std::abs(overlap) * std::abs(overlap);
    }

    /**
     * Calculate purity: Tr(ρ²) for pure states = 1.0
     */
    double getPurity() const {
        return amplitudes.squaredNorm();
    }

    /**
     * Calculate von Neumann entropy: -Σ|α_i|² log₂(|α_i|²)
     */
    double getEntropy() const {
        double entropy = 0.0;
        for (int i = 0; i < getDimension(); ++i) {
            double prob = getProbability(i);
            if (prob > 1e-10) {
                entropy -= prob * std::log2(prob);
            }
        }
        return entropy;
    }

    /**
     * Clone state
     */
    QuantumState clone() const {
        return QuantumState(num_qubits, amplitudes);
    }
};

/**
 * QuantumGate: Unitary operation on quantum state
 * U is unitary: U†U = I
 */
class QuantumGate {
private:
    MatrixXcd matrix;
    int target_qubits;

public:
    explicit QuantumGate(const MatrixXcd& U, int target = 1)
        : matrix(U), target_qubits(target) {
        validateUnitarity();
    }

    /**
     * Verify gate is unitary (U†U ≈ I)
     */
    void validateUnitarity(double tolerance = 1e-10) {
        MatrixXcd product = matrix.adjoint() * matrix;
        for (int i = 0; i < matrix.rows(); ++i) {
            for (int j = 0; j < matrix.cols(); ++j) {
                double expected = (i == j) ? 1.0 : 0.0;
                if (std::abs(product(i, j) - expected) > tolerance) {
                    throw std::invalid_argument("Gate is not unitary");
                }
            }
        }
    }

    const MatrixXcd& getMatrix() const { return matrix; }
    int getTargetQubits() const { return target_qubits; }

    /**
     * Apply gate to quantum state
     * |ψ'⟩ = U|ψ⟩
     */
    void apply(QuantumState& state) {
        if (state.getDimension() != matrix.rows()) {
            throw std::invalid_argument("Gate dimension mismatch with state");
        }
        state.getAmplitudes() = matrix * state.getAmplitudes();
        state.normalize();
    }
};

}  // namespace Qsim

#endif  // QSIM_CORE_HPP