
from django.db import transaction

from rest_framework import viewsets
from rest_framework.exceptions import ValidationError

from .models import (
    Empleado,
    Servicio,
    ConsumoServicio,
    Habitacion,
    Reserva,
)

from .serializers import (
    EmpleadoSerializer,
    ServicioSerializer,
    ConsumoServicioSerializer,
    HabitacionSerializer,
    ReservaSerializer,
)


class EmpleadoViewSet(viewsets.ModelViewSet):

    queryset = Empleado.objects.all()
    serializer_class = EmpleadoSerializer

    def perform_destroy(self, instance):

        if ConsumoServicio.objects.filter(
            empleado=instance
        ).exists():

            raise ValidationError({
                "error": (
                    "No se puede eliminar este empleado "
                    "porque tiene consumos registrados."
                )
            })

        instance.delete()


class ServicioViewSet(viewsets.ModelViewSet):

    queryset = Servicio.objects.all()
    serializer_class = ServicioSerializer

    def perform_destroy(self, instance):

        if ConsumoServicio.objects.filter(
            servicio=instance
        ).exists():

            raise ValidationError({
                "error": (
                    "No se puede eliminar este servicio "
                    "porque tiene consumos registrados."
                )
            })

        instance.delete()


class ConsumoServicioViewSet(viewsets.ModelViewSet):

    queryset = (
        ConsumoServicio.objects
        .select_related("empleado", "servicio")
        .all()
    )

    serializer_class = ConsumoServicioSerializer


class HabitacionViewSet(viewsets.ModelViewSet):

    queryset = Habitacion.objects.all()
    serializer_class = HabitacionSerializer


class ReservaViewSet(viewsets.ModelViewSet):

    queryset = Reserva.objects.all()
    serializer_class = ReservaSerializer

    @transaction.atomic
    def perform_create(self, serializer):

        reserva = serializer.save()

        habitacion = reserva.habitacion

        habitacion.estado = "Reservada"

        habitacion.save(
            update_fields=["estado"]
        )
