from django.db import models

# Create your models here.
from django.db import models


class Empleado(models.Model):

    nombre = models.CharField(max_length=100)

    apellido = models.CharField(max_length=100)

    cargo = models.CharField(max_length=50)

    telefono = models.CharField(max_length=20)

    fecha_ingreso = models.DateField()


    def __str__(self):
        return self.nombre



class Servicio(models.Model):

    nombre = models.CharField(max_length=100)

    descripcion = models.TextField()

    precio = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )


    def __str__(self):
        return self.nombre



class ConsumoServicio(models.Model):

    empleado = models.ForeignKey(
        Empleado,
        on_delete=models.CASCADE
    )

    servicio = models.ForeignKey(
        Servicio,
        on_delete=models.CASCADE
    )

    fecha = models.DateField()

    cantidad = models.IntegerField()

    total = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    def __str__(self):
        return f"{self.empleado} - {self.servicio}"


class Habitacion(models.Model):
    numero = models.CharField(max_length=10)
    tipo = models.CharField(max_length=50)

    precio = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    estado = models.CharField(max_length=20)

    def __str__(self):
        return self.numero

class Reserva(models.Model):

    cliente = models.CharField(max_length=100)

    habitacion = models.ForeignKey(
        Habitacion,
        on_delete=models.CASCADE
    )

    fecha_entrada = models.DateField()

    fecha_salida = models.DateField()

    estado = models.CharField(
        max_length=20,
        default="Reservada"
    )

    def __str__(self):
        return self.cliente    