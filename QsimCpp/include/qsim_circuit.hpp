#ifndef QSIM_CIRCUIT_HPP
#define QSIM_CIRCUIT_HPP

#include "qsim_core.hpp"
#include "qsim_gates.hpp"
#include <vector>
#include <memory>
#include <iostream>

namespace Qsim {

/**
 * QuantumCircuit: Represents a sequence of quantum operations
 * Manages state evolution through multiple gate applications
 */
class QuantumCircuit {
private:
    QuantumState state;
    std::vector<std::pair<std::string, QuantumGate>> operations;
    std::vector<int> measurement_results;

public:
    /**
     * Create quantum circuit with n qubits
     */
    explicit QuantumCircuit(int num_qubits = 1)
        : state(num_qubits) {}

    /**
     * Add single-qubit operation to circuit
     */
    void addGate(const std::string& name, const QuantumGate& gate) {
        operations.emplace_back(name, gate);
    }

    /**
     * Execute entire circuit
     */
    void execute() {
        for (auto& [name, gate] : operations) {
            gate.apply(state);
        }
    }

    /**
     * Execute and return state
     */
    const QuantumState& getState() const {
        return state;
    }

    /**
     * Measure qubit in computational basis
     * Returns: 0 or 1 with probabilities |α_0|² and |α_1|²
     */
    int measure(int num_shots = 1) {
        const auto& probs = state.getProbabilityDistribution();
        double r = (double)std::rand() / RAND_MAX;
        double cumsum = 0.0;
        for (size_t i = 0; i < probs.size(); ++i) {
            cumsum += probs[i];
            if (r < cumsum) {
                return i;
            }
        }
        return probs.size() - 1;
    }

    /**
     * Run circuit multiple times and collect statistics
     */
    std::vector<int> measureMultiple(int num_shots) {
        std::vector<int> results(num_shots);
        for (int i = 0; i < num_shots; ++i) {
            results[i] = measure();
        }
        return results;
    }

    /**
     * Reset circuit to initial state
     */
    void reset() {
        state = QuantumState(state.getNumQubits());
        operations.clear();
        measurement_results.clear();
    }

    /**
     * Print circuit statistics
     */
    void printStatistics() const {
        std::cout << "\n=== Quantum Circuit Statistics ===\n";
        std::cout << "Number of qubits: " << state.getNumQubits() << "\n";
        std::cout << "State dimension: " << state.getDimension() << "\n";
        std::cout << "Operations: " << operations.size() << "\n";
        std::cout << "State is normalized: " << (state.isNormalized() ? "Yes" : "No") << "\n";
        std::cout << "Purity: " << state.getPurity() << "\n";
        std::cout << "Entropy: " << state.getEntropy() << "\n";
        std::cout << "\nProbability Distribution:\n";
        const auto& probs = state.getProbabilityDistribution();
        for (size_t i = 0; i < probs.size(); ++i) {
            if (probs[i] > 1e-6) {
                std::cout << "  |" << i << "⟩: " << probs[i] << "\n";
            }
        }
    }
};

}  // namespace Qsim

#endif  // QSIM_CIRCUIT_HPP