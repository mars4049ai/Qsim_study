"""
Quantum Memory Visualization Model
===================================
Visual simulation of quantum memory with signal flow:
  Signal Sending Node → Optical Closed-Loop Cell → Signal Output

Based on photonic quantum memory theory and Qsim quantum simulation.
"""

import numpy as np
import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.patches import FancyBboxPatch, Circle, FancyArrowPatch, Rectangle
from matplotlib.animation import FuncAnimation
import json
from typing import List, Tuple


class SignalNode:
    """Visual representation of signal sending node."""
    
    def __init__(self, x, y, width=0.8, height=0.6):
        self.x = x
        self.y = y
        self.width = width
        self.height = height
        self.signal_strength = 0.0
    
    def draw(self, ax):
        """Draw the signal sending node."""
        # Main box
        box = FancyBboxPatch(
            (self.x - self.width/2, self.y - self.height/2),
            self.width, self.height,
            boxstyle="round,pad=0.1",
            edgecolor='#2196F3', facecolor='#E3F2FD',
            linewidth=2.5
        )
        ax.add_patch(box)
        
        # Label
        ax.text(self.x, self.y, 'Signal\nSender', 
               ha='center', va='center', fontsize=10, fontweight='bold')
        
        # Signal indicator
        circle = Circle((self.x + self.width/2 + 0.15, self.y), 0.08, 
                       color='#4CAF50', alpha=self.signal_strength)
        ax.add_patch(circle)


class OpticalCell:
    """Visual representation of optical closed-loop memory cell."""
    
    def __init__(self, x, y, radius=0.6):
        self.x = x
        self.y = y
        self.radius = radius
        self.storage_level = 0.0
        self.loop_count = 0
    
    def draw(self, ax):
        """Draw the optical closed-loop cell."""
        # Outer circle (cavity)
        outer = Circle((self.x, self.y), self.radius,
                      edgecolor='#FF9800', facecolor='none',
                      linewidth=3, linestyle='--')
        ax.add_patch(outer)
        
        # Inner circle (quantum memory)
        inner = Circle((self.x, self.y), self.radius * 0.6,
                      edgecolor='#FF9800', facecolor='#FFF3E0',
                      linewidth=2, alpha=0.7)
        ax.add_patch(inner)
        
        # Storage level indicator
        storage_angle = self.storage_level * 360
        theta = np.linspace(0, np.radians(storage_angle), 50)
        r = self.radius * 0.5
        ax.fill(self.x + r*np.cos(theta), self.y + r*np.sin(theta),
               color='#FFC107', alpha=0.6, label='Stored Energy' if self.loop_count == 0 else '')
        
        # Loop counter
        ax.text(self.x, self.y - self.radius - 0.2, 
               f'Loops: {self.loop_count}',
               ha='center', fontsize=9, style='italic')
        
        # Label
        ax.text(self.x, self.y, 'Quantum\nMemory\nCell',
               ha='center', va='center', fontsize=9, fontweight='bold')


class SignalOutput:
    """Visual representation of signal output node."""
    
    def __init__(self, x, y, width=0.8, height=0.6):
        self.x = x
        self.y = y
        self.width = width
        self.height = height
        self.output_strength = 0.0
        self.fidelity = 1.0
    
    def draw(self, ax):
        """Draw the signal output node."""
        # Main box
        box = FancyBboxPatch(
            (self.x - self.width/2, self.y - self.height/2),
            self.width, self.height,
            boxstyle="round,pad=0.1",
            edgecolor='#9C27B0', facecolor='#F3E5F5',
            linewidth=2.5
        )
        ax.add_patch(box)
        
        # Label
        ax.text(self.x, self.y + 0.1, 'Signal\nOutput',
               ha='center', va='center', fontsize=10, fontweight='bold')
        
        # Fidelity indicator
        fidelity_text = f'F:{self.fidelity:.2f}'
        ax.text(self.x, self.y - 0.25, fidelity_text,
               ha='center', va='top', fontsize=8, 
               bbox=dict(boxstyle='round', facecolor='wheat', alpha=0.5))


class QuantumMemoryVisualization:
    """Complete quantum memory system visualization."""
    
    def __init__(self, figsize=(14, 8)):
        self.fig, self.ax = plt.subplots(figsize=figsize)
        self.ax.set_xlim(-1, 11)
        self.ax.set_ylim(-1, 5)
        self.ax.axis('off')
        
        # Create components
        self.sender = SignalNode(1.5, 2.5)
        self.memory_cell = OpticalCell(5, 2.5)
        self.output = SignalOutput(8.5, 2.5)
        
        # Metrics
        self.storage_history = []
        self.fidelity_history = []
        self.time_steps = []
        
    def draw_system(self):
        """Draw the entire quantum memory system."""
        # Title
        self.ax.text(5, 4.5, 'Quantum Memory System: Signal Flow Architecture',
                    ha='center', fontsize=14, fontweight='bold')
        
        # Draw components
        self.sender.draw(self.ax)
        self.memory_cell.draw(self.ax)
        self.output.draw(self.ax)
        
        # Draw signal flow arrows
        arrow1 = FancyArrowPatch((self.sender.x + self.sender.width/2 + 0.1, self.sender.y),
                               (self.memory_cell.x - self.memory_cell.radius - 0.1, self.memory_cell.y),
                               arrowstyle='->', mutation_scale=30,
                               color='#2196F3', linewidth=2.5, alpha=0.7)
        self.ax.add_patch(arrow1)
        
        arrow2 = FancyArrowPatch((self.memory_cell.x + self.memory_cell.radius + 0.1, self.memory_cell.y),
                               (self.output.x - self.output.width/2 - 0.1, self.output.y),
                               arrowstyle='->', mutation_scale=30,
                               color='#FF9800', linewidth=2.5, alpha=0.7)
        self.ax.add_patch(arrow2)
        
        # Draw feedback loop (delay line)
        loop_y = 0.8
        self.ax.annotate('', xy=(self.memory_cell.x + 0.4, loop_y),
                        xytext=(self.memory_cell.x - 0.4, loop_y),
                        arrowprops=dict(arrowstyle='<-', lw=2, color='#FFC107', alpha=0.6))
        self.ax.text(self.memory_cell.x, loop_y - 0.3, 'Optical Delay Line (Closed-Loop)',
                    ha='center', fontsize=9, style='italic', color='#FF9800')
        
        # Draw photon cavity illustration
        cavity_x, cavity_y = 5, 2.5
        mirror1 = Rectangle((cavity_x - 0.8, cavity_y - 0.05), 0.15, 0.1,
                           color='#424242', alpha=0.8)
        mirror2 = Rectangle((cavity_x + 0.65, cavity_y - 0.05), 0.15, 0.1,
                           color='#424242', alpha=0.8)
        self.ax.add_patch(mirror1)
        self.ax.add_patch(mirror2)
        
        # Theory reference box
        theory_text = (
            "Quantum Memory Model (From PDF Theory):\n"
            "• Photonic quantum state storage\n"
            "• Optical round-trip delay τ = L/c\n"
            "• Cavity photon lifetime (coherence)\n"
            "• State fidelity F = |⟨ψ_in|ψ_out⟩|²"
        )
        self.ax.text(5, -0.6, theory_text,
                    ha='center', fontsize=8,
                    bbox=dict(boxstyle='round', facecolor='#E8F5E9', alpha=0.8))

    def simulate_storage_cycle(self, num_loops=5, decoherence_factor=0.95):
        """Simulate quantum state storage and retrieval."""
        fidelity = 1.0
        
        for loop in range(num_loops):
            # Apply loop effects
            fidelity *= decoherence_factor  # Decoherence per loop
            
            self.time_steps.append(loop)
            self.storage_history.append(1.0 - (1.0 - fidelity) / (1.0 - decoherence_factor**(num_loops-1)))
            self.fidelity_history.append(fidelity)
        
        self.memory_cell.loop_count = num_loops
        self.memory_cell.storage_level = min(fidelity, 0.95)
        self.output.fidelity = fidelity

    def plot_metrics(self):
        """Plot fidelity and storage metrics over time."""
        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 4))
        
        # Fidelity over time
        ax1.plot(self.time_steps, self.fidelity_history, 'o-', 
                color='#2196F3', linewidth=2.5, markersize=8, label='State Fidelity')
        ax1.axhline(y=0.9, color='#FF9800', linestyle='--', label='90% Threshold')
        ax1.set_xlabel('Round-trip Loop Number', fontsize=11, fontweight='bold')
        ax1.set_ylabel('Fidelity F = |⟨ψ_in|ψ_out⟩|²', fontsize=11, fontweight='bold')
        ax1.set_title('Quantum State Fidelity Degradation', fontsize=12, fontweight='bold')
        ax1.grid(True, alpha=0.3)
        ax1.legend()
        ax1.set_ylim([0, 1.05])
        
        # Storage energy level
        ax2.bar(self.time_steps, self.storage_history, color='#FFC107', alpha=0.7, edgecolor='#FF9800', linewidth=2)
        ax2.set_xlabel('Round-trip Loop Number', fontsize=11, fontweight='bold')
        ax2.set_ylabel('Stored State Amplitude', fontsize=11, fontweight='bold')
        ax2.set_title('Quantum Information Storage Level', fontsize=12, fontweight='bold')
        ax2.grid(True, alpha=0.3, axis='y')
        ax2.set_ylim([0, 1.05])
        
        plt.tight_layout()
        return fig


def main():
    print("\n" + "="*70)
    print("QUANTUM MEMORY VISUALIZATION")
    print("Optical Closed-Loop System with Signal Delay")
    print("="*70 + "\n")
    
    # Create visualization
    viz = QuantumMemoryVisualization()
    viz.draw_system()
    plt.tight_layout()
    plt.savefig('quantum_memory_architecture.png', dpi=150, bbox_inches='tight')
    print("✓ Saved: quantum_memory_architecture.png")
    
    # Simulate storage cycles
    print("\nSimulating quantum memory storage cycles...")
    viz.simulate_storage_cycle(num_loops=8, decoherence_factor=0.93)
    
    # Plot metrics
    metrics_fig = viz.plot_metrics()
    plt.savefig('quantum_memory_metrics.png', dpi=150, bbox_inches='tight')
    print("✓ Saved: quantum_memory_metrics.png")
    
    # Export metrics as JSON
    metrics_data = {
        'system': 'Quantum Memory - Optical Closed-Loop',
        'timestamps': viz.time_steps,
        'fidelity_history': [float(f) for f in viz.fidelity_history],
        'storage_levels': [float(s) for s in viz.storage_history],
        'final_fidelity': float(viz.fidelity_history[-1]),
        'decoherence_rate_per_loop': 0.07  # 1 - 0.93
    }
    
    with open('quantum_memory_metrics.json', 'w') as f:
        json.dump(metrics_data, f, indent=2)
    print("✓ Saved: quantum_memory_metrics.json")
    
    print("\n" + "="*70)
    print("Visualization complete!")
    print("="*70 + "\n")
    plt.show()


if __name__ == "__main__":
    main()
