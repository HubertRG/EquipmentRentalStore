# Sports Equipment Rental Store

A modern web application for browsing and renting store equipment with real-time availability. Designed for both customers and administrators, with a responsive and accessible interface, and full user account management.

## Features

### General User Functionality
- **Browse product catalog** with real-time availability
- **Filter products** by:
  - category
  - name
  - availability status
- **Light/Dark mode toggle**
- **Fully responsive UI**

### Store Reviews
- Submit reviews
- Browse all existing customer reviews
- Display of average rating

### Contact Form
- Submit a question via a contact form
- Admins can manage questions

### User Account Features
- Create an account
- Log in and log out
- Edit personal data
- Change password (using old password)
- Delete account

### Equipment Reservation
- Select equipment, pick-up and return dates & times
- Choose store location for pick-up/return
- View reservation history
- Edit reservation (dates or store location)
- Cancel reservation

### Admin Panel
- Add, edit and delete equipment
- Remove user reviews, contact form questions, users, and reservations

---

## Tech Stack

- **Frontend:** React, Tailwind CSS, Axios
- **Backend:** Node.js, Express
- **Database:** MongoDB
- **Authentication:** JSON Web Tokens (JWT)
- **Deployment:** Docker
- **Other:**  dark mode toggle, form validation

---

## Install Instructions

1. **Clone the repository**
```bash
git clone https://github.com/hubertrg/EquipmentRentalStore.git
```
2. **Start docker container**
```bash
docker compose up --build
```
