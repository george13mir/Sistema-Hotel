from django.db import models


class Habitacion(models.Model):

    TIPOS = (
        ('Individual', 'Individual'),
        ('Doble', 'Doble'),
        ('Suite', 'Suite'),
    )

    ESTADOS = (
        ('Disponible', 'Disponible'),
        ('Ocupada', 'Ocupada'),
        ('Mantenimiento', 'Mantenimiento'),
    )


    numero = models.IntegerField(
        unique=True
    )

    tipo = models.CharField(
        max_length=20,
        choices=TIPOS
    )

    capacidad = models.IntegerField()

    precio_noche = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    estado = models.CharField(
        max_length=20,
        choices=ESTADOS,
        default="Disponible"
    )

    descripcion = models.TextField(
        blank=True
    )


    def __str__(self):
        return f"Habitación {self.numero}"