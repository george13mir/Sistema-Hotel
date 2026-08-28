from rest_framework import viewsets

from .models import Empleado, Servicio, ConsumoServicio, Habitacion, Reserva

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



class ServicioViewSet(viewsets.ModelViewSet):

    queryset = Servicio.objects.all()

    serializer_class = ServicioSerializer



class ConsumoServicioViewSet(viewsets.ModelViewSet):

    queryset = ConsumoServicio.objects.all()

    serializer_class = ConsumoServicioSerializer


class HabitacionViewSet(viewsets.ModelViewSet):
    queryset = Habitacion.objects.all()
    serializer_class = HabitacionSerializer

class ReservaViewSet(viewsets.ModelViewSet):

    queryset = Reserva.objects.all()
    serializer_class = ReservaSerializer

    def perform_create(self, serializer):

        reserva = serializer.save()

        habitacion = reserva.habitacion

        habitacion.estado = "Reservada"

        habitacion.save()