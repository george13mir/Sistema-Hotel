from rest_framework import serializers

from .models import Empleado, Servicio, ConsumoServicio, Habitacion, Reserva


class EmpleadoSerializer(serializers.ModelSerializer):

    class Meta:
        model = Empleado
        fields = '__all__'



class ServicioSerializer(serializers.ModelSerializer):

    class Meta:
        model = Servicio
        fields = '__all__'



class ConsumoServicioSerializer(serializers.ModelSerializer):

    class Meta:
        model = ConsumoServicio
        fields = '__all__'


class HabitacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Habitacion
        fields = '__all__'


class ReservaSerializer(serializers.ModelSerializer):

    habitacion_numero = serializers.CharField(
        source="habitacion.numero",
        read_only=True
    )

    class Meta:
        model = Reserva
        fields = [
            "id",
            "cliente",
            "habitacion",
            "habitacion_numero",
            "fecha_entrada",
            "fecha_salida",
            "estado"
        ]