# ☕ Campus Café Ordering System

A full-stack web application designed to simplify campus meal ordering.  
Students can order food and drinks from the university café easily — either for delivery to their dorms or cafeteria pickup — while admins efficiently manage orders, menus, and analytics from a single dashboard.

---

## 🌟 Overview

The **Campus Café Ordering System** is a modern, responsive web app built for university cafeterias to digitize food ordering and management.  
It includes two main interfaces:

- **🎓 Student UI** – Browse menu, place orders, and track status (no login required)
- **👩‍🍳 Admin Dashboard** – Manage menu items, monitor orders in real-time, and view analytics

---

## 🚀 Features

### 🎓 Student Side
- Browse categorized **Food & Drinks**
- Place orders with details (block, dorm, delivery/pickup)
- Choose **time slots** for lunch or pre-scheduled orders
- View recent order history (via local storage)
- “Repeat Last Order” option for convenience
- Responsive and mobile-friendly design

### 👩‍🍳 Admin Side
- Secure **email/password login**
- **View, filter, and search** orders
- **Real-time notifications** when new orders arrive
- Manage menu items (add/edit/delete)
- Print or download **order receipts (PDF)**
- **Dashboard analytics** (total orders, revenue, top items)
- Smart recommendations for popular items

---

## 🧱 Tech Stack

| Layer | Technology |
|-------|-------------|
| **Frontend** | React, Vite, Tailwind CSS, Shadcn/UI |
| **Backend** | Supabase (PostgreSQL + Realtime) |
| **State Management** | React Hooks / Context |
| **Auth** | Supabase Auth (email/password) |
| **Charts** | Recharts / Chart.js |
| **Deployment** | Vercel / Netlify |

---

## 📊 Data Model

**Food**
| Field | Type | Description |
|-------|------|-------------|
| id | int | Primary Key |
| name | string | Food name |
| price | decimal | Price of item |
| description | text | Short description |
| image | string | Image URL |
| available | boolean | Availability |
| category | enum | food / drink |

**Order**
| Field | Type | Description |
|-------|------|-------------|
| id | int | Primary Key |
| student_name | string | Full name |
| student_id | string | Student ID |
| phone | string | Contact number |
| order_type | enum | delivery / cafeteria |
| block_type | string | Campus block |
| dorm_number | string | Dorm room number |
| time_slot | string | Chosen time slot |
| status | enum | pending / completed |
| created_at | datetime | Order time |

**OrderItem**
| Field | Type | Description |
|-------|------|-------------|
| id | int | Primary Key |
| order_id | foreign key → Order | Related order |
| food_id | foreign key → Food | Related food item |
| quantity | int | Quantity ordered |

---

## 📸 Screenshots
### Student Side
<img width="2846" height="1522" alt="image" src="https://github.com/user-attachments/assets/f111b3d7-a3d6-4290-bf74-40dc82f2afa6" />
<img width="1412" height="1520" alt="image" src="https://github.com/user-attachments/assets/5c2c4265-cc3a-461b-9d69-12da8c783799" />
<img width="2846" height="1528" alt="image" src="https://github.com/user-attachments/assets/d17174e1-a1bb-4131-a1f7-220b3e7e5ab4" />
<img width="1222" height="1534" alt="image" src="https://github.com/user-attachments/assets/78e9ad14-3be4-4665-8412-67ddd20450c9" />

### Admin Side
<img width="2850" height="1528" alt="image" src="https://github.com/user-attachments/assets/62c1cef9-703d-429b-9300-ef5c49146fd0" />
<img width="2358" height="1210" alt="image" src="https://github.com/user-attachments/assets/3e5de56d-b60e-4325-8663-8d62c83a8b6f" />
<img width="2834" height="1536" alt="image" src="https://github.com/user-attachments/assets/a11a18c8-9255-4914-a965-1007d88c57f1" />
<img width="2848" height="1508" alt="image" src="https://github.com/user-attachments/assets/d2ab347a-26f6-4131-b449-91f49845dfc6" />

---

## ⚙️ Setup & Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/campus-cafe-ordering-system.git
   cd campus-cafe-ordering-system
