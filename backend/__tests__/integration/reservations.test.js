const request = require('supertest');
const express = require('express');
const bcrypt = require('bcryptjs');
const { User } = require('../../src/models/User');
const Equipment = require('../../src/models/Equipment');
const Reservation = require('../../src/models/Reservation');
const reservationRoutes = require('../../src/controllers/reservationController');

process.env.JWTPRIVATEKEY = 'test-secret-key';
process.env.SALT = '10';

const app = express();
app.use(express.json());
app.use('/reservation', reservationRoutes);

describe('Reservation Routes - Integration Tests', () => {
  let testUser;
  let testEquipment;
  let authToken;

  beforeEach(async () => {
    // Create a test user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('TestPassword123!', salt);

    testUser = await User.create({
      fullName: 'Test User',
      userName: 'testuser',
      email: 'test@example.com',
      phonenumber: '123456789',
      password: hashedPassword,
      role: 'user',
    });

    // Generate token
    authToken = testUser.generateAuthToken();

    // Create test equipment
    testEquipment = await Equipment.create({
      name: 'Sony A7 Camera',
      category: 'Cameras',
      description: 'Professional camera',
      pricePerDay: 200,
      available: true,
    });
  });

  describe('POST /reservation', () => {
    test('Should create a new reservation with valid data', async () => {
      const reservationData = {
        equipment: testEquipment._id,
        startDate: new Date('2025-12-01'),
        endDate: new Date('2025-12-05'),
        startTime: '10:00',
        endTime: '18:00',
        pickupPlace: 'delivery',
        deliveryAddressPickup: {
          city: 'Warsaw',
          street: 'Main Street',
          houseNumber: '1',
          apartmentNumber: '5',
        },
        deliveryAddressReturn: {
          city: 'Warsaw',
          street: 'Main Street',
          houseNumber: '1',
          apartmentNumber: '5',
        },
        price: 800,
      };

      const response = await request(app)
        .post('/reservation')
        .set('Authorization', `Bearer ${authToken}`)
        .send(reservationData)
        .expect(201);

      expect(response.body._id).toBeDefined();
      expect(response.body.equipment.toString()).toBe(
        testEquipment._id.toString()
      );
      expect(response.body.user.toString()).toBe(testUser._id.toString());
      expect(response.body.price).toBe(800);

      // Check if reservation was added to the database
      const reservation = await Reservation.findById(response.body._id);
      expect(reservation).toBeDefined();
      expect(reservation.pickupPlace).toBe('delivery');
    });

    test('Should return 403 error when authorization token is missing', async () => {
      const reservationData = {
        equipment: testEquipment._id,
        startDate: new Date('2025-12-01'),
        endDate: new Date('2025-12-05'),
        startTime: '10:00',
        endTime: '18:00',
        pickupPlace: 'delivery',
        deliveryAddressPickup: {
          city: 'Warsaw',
          street: 'Main Street',
          houseNumber: '1',
        },
        deliveryAddressReturn: {
          city: 'Warsaw',
          street: 'Main Street',
          houseNumber: '1',
        },
        price: 800,
      };

      await request(app)
        .post('/reservation')
        .send(reservationData)
        .expect(403);
    });

    test('Should return 400 error when required fields are missing', async () => {
      const incompleteData = {
        equipment: testEquipment._id,
      };

      const response = await request(app)
        .post('/reservation')
        .set('Authorization', `Bearer ${authToken}`)
        .send(incompleteData)
        .expect(400);

      expect(response.body.errors).toBeDefined();
    });

    test('Should return 404 error when equipment does not exist', async () => {
      const reservationData = {
        equipment: '507f1f77bcf86cd799439011',
        startDate: new Date('2025-12-01'),
        endDate: new Date('2025-12-05'),
        startTime: '10:00',
        endTime: '18:00',
        pickupPlace: 'delivery',
        deliveryAddressPickup: {
          city: 'Warsaw',
          street: 'Main Street',
          houseNumber: '1',
        },
        deliveryAddressReturn: {
          city: 'Warsaw',
          street: 'Main Street',
          houseNumber: '1',
        },
        price: 800,
      };

      const response = await request(app)
        .post('/reservation')
        .set('Authorization', `Bearer ${authToken}`)
        .send(reservationData)
        .expect(404);

      expect(response.body.message).toBe('Sprzęt nie istnieje');
    });
  });

  describe('GET /reservation', () => {
    beforeEach(async () => {
      // Create a few reservations for the test user
      await Reservation.create({
        equipment: testEquipment._id,
        user: testUser._id,
        startDate: new Date('2025-12-01'),
        endDate: new Date('2025-12-05'),
        startTime: '10:00',
        endTime: '18:00',
        pickupPlace: 'delivery',
        deliveryAddressPickup: {
          city: 'Warsaw',
          street: 'Main Street',
          houseNumber: '1',
        },
        deliveryAddressReturn: {
          city: 'Warsaw',
          street: 'Main Street',
          houseNumber: '1',
        },
        price: 800,
      });
    });

    test('Should return a list of reservations for the logged-in user', async () => {
      const response = await request(app)
        .get('/reservation')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('equipmentName');
      expect(response.body[0]).toHaveProperty('startDate');
      expect(response.body[0]).toHaveProperty('endDate');
      expect(response.body[0]).toHaveProperty('price');
    });

    test('Should return 403 error when token is missing', async () => {
      await request(app).get('/reservation').expect(403);
    });
  });

  describe('DELETE /reservation/:id', () => {
    let testReservation;

    beforeEach(async () => {
      testReservation = await Reservation.create({
        equipment: testEquipment._id,
        user: testUser._id,
        startDate: new Date('2025-12-01'),
        endDate: new Date('2025-12-05'),
        startTime: '10:00',
        endTime: '18:00',
        pickupPlace: 'delivery',
        deliveryAddressPickup: {
          city: 'Warsaw',
          street: 'Main Street',
          houseNumber: '1',
        },
        deliveryAddressReturn: {
          city: 'Warsaw',
          street: 'Main Street',
          houseNumber: '1',
        },
        price: 800,
      });
    });

    test('Should delete the reservation', async () => {
      const response = await request(app)
        .delete(`/reservation/${testReservation._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.message).toBe('Rezerwacja usunięta');

      // Check if reservation was deleted from database
      const reservation = await Reservation.findById(testReservation._id);
      expect(reservation).toBeNull();
    });

    test('Should return 404 error when reservation does not exist', async () => {
      const response = await request(app)
        .delete('/reservation/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.message).toBe('Rezerwacja nie znaleziona');
    });

    test('Should return 403 error when token is missing', async () => {
      await request(app)
        .delete(`/reservation/${testReservation._id}`)
        .expect(403);
    });
  });

  describe('PUT /reservation/:id', () => {
    let testReservation;

    beforeEach(async () => {
      testReservation = await Reservation.create({
        equipment: testEquipment._id,
        user: testUser._id,
        startDate: new Date('2025-12-01'),
        endDate: new Date('2025-12-05'),
        startTime: '10:00',
        endTime: '18:00',
        pickupPlace: 'delivery',
        deliveryAddressPickup: {
          city: 'Warsaw',
          street: 'Main Street',
          houseNumber: '1',
        },
        deliveryAddressReturn: {
          city: 'Warsaw',
          street: 'Main Street',
          houseNumber: '1',
        },
        price: 800,
      });
    });

    test('Should update the reservation', async () => {
      const updateData = {
        startTime: '12:00',
        endTime: '20:00',
        price: 1000,
      };

      const response = await request(app)
        .put(`/reservation/${testReservation._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.startTime).toBe('12:00');
      expect(response.body.endTime).toBe('20:00');
      expect(response.body.price).toBe(1000);

      // Check in database
      const updated = await Reservation.findById(testReservation._id);
      expect(updated.startTime).toBe('12:00');
      expect(updated.price).toBe(1000);
    });

    test('Should return 404 error when reservation does not exist', async () => {
      const response = await request(app)
        .put('/reservation/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ price: 1000 })
        .expect(404);

      expect(response.body.message).toBe('Rezerwacja nie znaleziona');
    });
  });
});