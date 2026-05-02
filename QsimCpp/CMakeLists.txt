cmake_minimum_required(VERSION 3.15)
project(QsimCpp VERSION 1.0.0 LANGUAGES CXX)

# C++ Standard
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Find Eigen3
find_package(Eigen3 REQUIRED CONFIG)

# Library target
add_library(qsim_cpp INTERFACE)
target_include_directories(qsim_cpp INTERFACE
    $<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}/include>
    $<INSTALL_INTERFACE:include>
)
target_link_libraries(qsim_cpp INTERFACE Eigen3::Eigen)

# Example executable
add_executable(qsim_example examples/qsim_example.cpp)
target_link_libraries(qsim_example PRIVATE qsim_cpp)

# Tests (optional)
if(BUILD_TESTING)
    enable_testing()
    add_executable(qsim_tests tests/qsim_tests.cpp)
    target_link_libraries(qsim_tests PRIVATE qsim_cpp)
    add_test(NAME QsimTests COMMAND qsim_tests)
endif()