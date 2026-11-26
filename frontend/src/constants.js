/**
 * Core Constants for the Automated Code Review & Refactoring Engine
 * These mirror the expected DTO structure from the REST API
 */

export const MODEL_TYPES = ['nemotron', 'gpt4o', 'gemini', 'claude'];

export const REFACTORING_GOALS = [
  'reduce_complexity',
  'modernize_syntax',
  'improve_readability',
  'optimize_performance',
  'add_tests',
  'apply_patterns',
];

export const MOCK_LEGACY_JAVA = `public class LegacyOrderProcessor {
    
    private List<Order> orders = new ArrayList<>();
    private Map<String, Customer> customers = new HashMap<>();
    private static final double TAX_RATE = 0.08;
    
    public void processOrders() {
        for (int i = 0; i < orders.size(); i++) {
            Order order = orders.get(i);
            if (order != null && order.getCustomer() != null) {
                Customer customer = order.getCustomer();
                if (customers.containsKey(customer.getId())) {
                    double total = 0;
                    for (Item item : order.getItems()) {
                        if (item != null && item.getPrice() > 0) {
                            total += item.getPrice() * item.getQuantity();
                        }
                    }
                    double tax = total * TAX_RATE;
                    double finalTotal = total + tax;
                    
                    if (customer.isVip()) {
                        finalTotal = finalTotal * 0.9;
                    }
                    
                    System.out.println("Processing order " + order.getId() + " for " + customer.getName() + ": $" + finalTotal);
                    
                    try {
                        Thread.sleep(100);
                    } catch (InterruptedException e) {
                        e.printStackTrace();
                    }
                }
            }
        }
    }
    
    public void addOrder(Order order) {
        if (order != null) {
            orders.add(order);
        }
    }
    
    public List<Order> getOrders() {
        return orders;
    }
}`;

export const STUDENT_PROCESSOR_JAVA = `public class StudentProcessor {


    public void processStudents(List<Student> students) {


        for (int i = 0; i < students.size(); i++) {
            Student student = students.get(i);


            for (int j = 0; j < students.size(); j++) {
                Student other = students.get(j);


                for (int k = 0; k < 5; k++) {
                    if (student != null && other != null) {
                        if (student.getId() == other.getId()) {
                            System.out.println(student.getName());
                        }
                    }
                }
            }
        }
    }
}`;

export const MODEL_CONFIGS = {
  nemotron: {
    type: 'nemotron',
    name: 'NVIDIA Nemotron',
    shortName: 'Nemotron',
    color: '#76B900',
    bgColor: 'rgba(118, 185, 0, 0.1)',
    borderColor: 'rgba(118, 185, 0, 0.3)',
    icon: 'cpu',
    description: "NVIDIA's ultra-fast code generation model",
  },
  gpt4o: {
    type: 'gpt4o',
    name: 'GPT-4o',
    shortName: 'GPT-4o',
    color: '#10A37F',
    bgColor: 'rgba(16, 163, 127, 0.1)',
    borderColor: 'rgba(16, 163, 127, 0.3)',
    icon: 'brain',
    description: "OpenAI's flagship multimodal model",
  },
  gemini: {
    type: 'gemini',
    name: 'Google Gemini',
    shortName: 'Gemini',
    color: '#4285F4',
    bgColor: 'rgba(66, 133, 244, 0.1)',
    borderColor: 'rgba(66, 133, 244, 0.3)',
    icon: 'sparkles',
    description: "Google's most capable AI model",
  },
  claude: {
    type: 'claude',
    name: 'Claude 3.5 Sonnet',
    shortName: 'Claude 3.5',
    color: '#D97757',
    bgColor: 'rgba(217, 119, 87, 0.1)',
    borderColor: 'rgba(217, 119, 87, 0.3)',
    icon: 'bot',
    description: "Anthropic's most intelligent model",
  },
};

export const DEFAULT_MODEL_ORDER = ['nemotron', 'gpt4o', 'gemini', 'claude'];

export const MOCK_API_RESPONSE = {
  "batch_id": "req-mock-1234",
  "results": [
    { 
      "model_name": "Ollama (Qwen)", 
      "time_complexity": "O(n)", 
      "space_complexity": "O(1)", 
      "cyclomatic_complexity": 3, 
      "response_time_ms": 1205, 
      "retry_count": 1, 
      "refactored_code": "public void optimized() {\n  // Ollama refactored code\n}" 
    },
    { 
      "model_name": "Claude 3.5", 
      "time_complexity": "O(log n)", 
      "space_complexity": "O(1)", 
      "cyclomatic_complexity": 2, 
      "response_time_ms": 450, 
      "retry_count": 0, 
      "refactored_code": "public void optimized() {\n  // Claude refactored code\n}" 
    },
    { 
      "model_name": "GPT-4o", 
      "time_complexity": "O(log n)", 
      "space_complexity": "O(1)", 
      "cyclomatic_complexity": 2, 
      "response_time_ms": 600, 
      "retry_count": 0, 
      "refactored_code": "public void optimized() {\n  // GPT refactored code\n}" 
    },
    { 
      "model_name": "Gemini 1.5", 
      "time_complexity": "O(n)", 
      "space_complexity": "O(n)", 
      "cyclomatic_complexity": 3, 
      "response_time_ms": 520, 
      "retry_count": 0, 
      "refactored_code": "public void optimized() {\n  // Gemini refactored code\n}" 
    }
  ]
};