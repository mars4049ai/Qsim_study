#include <iostream>
#include <vector>
#include <complex>
#include <cmath>
#include <chrono>
#include <iomanip>

using namespace std;
using Complex = complex<double>;

class QuantumCircuit {
private:
    int num_qubits;
    int num_states;
    vector<Complex> state;
    vector<string> gate_log;
    double execution_time;
    
    // Hadamard gate
    vector<vector<Complex>> hadamard_matrix(int qubit) {
        vector<vector<Complex>> h(num_states, vector<Complex>(num_states, 0.0));
        double inv_sqrt2 = 1.0 / sqrt(2.0);
        
        for (int i = 0; i < num_states; i++) {
            for (int j = 0; j < num_states; j++) {
                int i_flip = i ^ (1 << qubit);
                if (j == i || j == i_flip) {
                    h[i][j] = inv_sqrt2;
                }
            }
        }
        return h;
    }
    
    // Pauli-X gate
    vector<vector<Complex>> pauli_x_matrix(int qubit) {
        vector<vector<Complex>> x(num_states, vector<Complex>(num_states, 0.0));
        
        for (int i = 0; i < num_states; i++) {
            int j = i ^ (1 << qubit);
            x[i][j] = 1.0;
        }
        return x;
    }
    
    // Apply matrix to state
    void apply_matrix(const vector<vector<Complex>>& matrix) {
        vector<Complex> new_state(num_states, 0.0);
        for (int i = 0; i < num_states; i++) {
            for (int j = 0; j < num_states; j++) {
                new_state[i] += matrix[i][j] * state[j];
            }
        }
        state = new_state;
        normalize_state();
    }
    
    // Normalize quantum state
    void normalize_state() {
        double norm = 0.0;
        for (const auto& amp : state) {
            norm += norm(amp);
        }
        norm = sqrt(norm);
        if (norm > 0) {
            for (auto& amp : state) {
                amp /= norm;
            }
        }
    }
    
public:
    QuantumCircuit(int qubits) : num_qubits(qubits) {
        num_states = 1 << qubits;  // 2^qubits
        state.resize(num_states, 0.0);
        state[0] = 1.0;  // Initialize to |0...0⟩
        execution_time = 0.0;
    }
    
    void apply_hadamard(int qubit) {
        auto matrix = hadamard_matrix(qubit);
        apply_matrix(matrix);
        gate_log.push_back("H(" + to_string(qubit) + ")");
    }
    
    void apply_pauli_x(int qubit) {
        auto matrix = pauli_x_matrix(qubit);
        apply_matrix(matrix);
        gate_log.push_back("X(" + to_string(qubit) + ")");
    }
    
    void apply_pauli_y(int qubit) {
        vector<vector<Complex>> y(num_states, vector<Complex>(num_states, 0.0));
        Complex i_unit(0.0, 1.0);
        
        for (int j = 0; j < num_states; j++) {
            int k = j ^ (1 << qubit);
            y[j][k] = (j & (1 << qubit)) ? i_unit : -i_unit;
        }
        apply_matrix(y);
        gate_log.push_back("Y(" + to_string(qubit) + ")");
    }
    
    void apply_pauli_z(int qubit) {
        vector<vector<Complex>> z(num_states, vector<Complex>(num_states, 0.0));
        
        for (int i = 0; i < num_states; i++) {
            z[i][i] = (i & (1 << qubit)) ? -1.0 : 1.0;
        }
        apply_matrix(z);
        gate_log.push_back("Z(" + to_string(qubit) + ")");
    }
    
    void apply_cnot(int control, int target) {
        vector<vector<Complex>> cnot(num_states, vector<Complex>(num_states, 0.0));
        
        for (int i = 0; i < num_states; i++) {
            if (i & (1 << control)) {
                int j = i ^ (1 << target);
                cnot[j][i] = 1.0;
            } else {
                cnot[i][i] = 1.0;
            }
        }
        apply_matrix(cnot);
        gate_log.push_back("CNOT(" + to_string(control) + "," + to_string(target) + ")");
    }
    
    void display_state() {
        cout << "\n╔════════════════════════════════════════════════╗\n";
        cout << "║          QUANTUM STATE PROBABILITIES          ║\n";
        cout << "╚════════════════════════════════════════════════╝\n\n";
        
        for (int i = 0; i < num_states; i++) {
            double prob = norm(state[i]);
            if (prob > 1e-10) {
                cout << "|";
                for (int j = num_qubits - 1; j >= 0; j--) {
                    cout << ((i >> j) & 1);
                }
                cout << "⟩: " << fixed << setprecision(2) << (prob * 100) << "%\n";
            }
        }
    }
    
    void display_gate_log() {
        cout << "\n╔════════════════════════════════════════════════╗\n";
        cout << "║            GATE SEQUENCE                       ║\n";
        cout << "╚════════════════════════════════════════════════╝\n\n";
        
        for (int i = 0; i < gate_log.size(); i++) {
            cout << "  " << (i + 1) << ". " << gate_log[i] << "\n";
        }
    }
    
    int get_gate_count() const {
        return gate_log.size();
    }
    
    double get_execution_time() const {
        return execution_time;
    }
    
    void set_execution_time(double time_us) {
        execution_time = time_us;
    }
};

int main() {
    cout << "\n╔════════════════════════════════════════════════╗\n";
    cout << "║  Quantum Circuit Simulator - C++ Version      ║\n";
    cout << "╚════════════════════════════════════════════════╝\n";
    
    // Benchmark: 300 gates (100 iterations × 3 gates)
    auto start = chrono::high_resolution_clock::now();
    
    QuantumCircuit qc(2);
    
    for (int i = 0; i < 100; i++) {
        qc.apply_hadamard(0);
        qc.apply_cnot(0, 1);
        qc.apply_pauli_x(1);
    }
    
    auto end = chrono::high_resolution_clock::now();
    double execution_time = chrono::duration<double, micro>(end - start).count();
    qc.set_execution_time(execution_time);
    
    // Display results
    qc.display_state();
    qc.display_gate_log();
    
    // Performance statistics
    cout << "\n═══════════════════════════════════════════════════\n";
    cout << "  C++ Execution Time: " << fixed << setprecision(2) 
         << execution_time << " μs\n";
    cout << "  Total Gates Applied: " << qc.get_gate_count() << "\n";
    cout << "  Gates/μs: " << fixed << setprecision(2) 
         << (qc.get_gate_count() / execution_time) << "\n";
    cout << "═══════════════════════════════════════════════════\n\n";
    
    // Performance comparison
    cout << "┌─────────────────────────────────────────┐\n";
    cout << "│  PYTHON VS C++ BENCHMARK COMPARISON     │\n";
    cout << "├─────────────────────────────────────────┤\n";
    cout << "│  Python:  ~2500 μs                      │\n";
    cout << "│  C++:     " << fixed << setprecision(2) << execution_time << " μs\n";
    cout << "│  Speedup: " << fixed << setprecision(1) << (2500.0 / execution_time) << "x\n";
    cout << "└─────────────────────────────────────────┘\n\n";
    
    cout << "✅ Simulation complete!\n\n";
    
    return 0;
}
