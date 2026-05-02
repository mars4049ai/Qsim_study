cmake_minimum_required(VERSION 3.15)
project(QuantumSimulator)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -O3 -march=native")

# Create executable for C++ simulator
add_executable(quantum_simulator quantum_circuit.cpp)

# Set output directory
set_target_properties(quantum_simulator PROPERTIES
    RUNTIME_OUTPUT_DIRECTORY "${CMAKE_BINARY_DIR}/bin"
)

# Custom target to run the simulator
add_custom_target(run
    COMMAND ${CMAKE_BINARY_DIR}/bin/quantum_simulator
    DEPENDS quantum_simulator
    COMMENT "Running Quantum Circuit Simulator..."
)

# Installation
install(TARGETS quantum_simulator DESTINATION bin)
