
from decimal import Decimal

from rest_framework import serializers

from .models import (
    Empleado,
    Servicio,
    ConsumoServicio,
    Habitacion,
    Reserva,
)


class EmpleadoSerializer(serializers.ModelSerializer):

    class Meta:
        model = Empleado
        fields = "__all__"

    def validate_nombre(self, value):
        if not value.strip():
            raise serializers.ValidationError(
                "El nombre no puede estar vacío."
            )
        return value.strip()

    def validate_apellido(self, value):
        if not value.strip():
            raise serializers.ValidationError(
                "El apellido no puede estar vacío."
            )
        return value.strip()


class ServicioSerializer(serializers.ModelSerializer):

    class Meta:
        model = Servicio
        fields = "__all__"

    def validate_precio(self, value):
        if value < Decimal("0.00"):
            raise serializers.ValidationError(
                "El precio no puede ser negativo."
            )
        return value


class ConsumoServicioSerializer(serializers.ModelSerializer):

    empleado_nombre = serializers.SerializerMethodField()
    servicio_nombre = serializers.CharField(
        source="servicio.nombre",
        read_only=True
    )

    total = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        read_only=True
    )

    class Meta:
        model = ConsumoServicio
        fields = [
            "id",
            "empleado",
            "empleado_nombre",
            "servicio",
            "servicio_nombre",
            "fecha",
            "cantidad",
            "total",
        ]

    def get_empleado_nombre(self, obj):
        return (
            f"{obj.empleado.nombre} "
            f"{obj.empleado.apellido}"
        )

    def validate_cantidad(self, value):
        if value <= 0:
            raise serializers.ValidationError(
                "La cantidad debe ser mayor que cero."
            )
        return value

    def validate(self, attrs):
        servicio = attrs.get("servicio")

        if servicio is None and self.instance is not None:
            servicio = self.instance.servicio

        cantidad = attrs.get("cantidad")

        if cantidad is None and self.instance is not None:
            cantidad = self.instance.cantidad

        if servicio is not None and cantidad is not None:
            total = servicio.precio * cantidad

            if total > Decimal("99999999.99"):
                raise serializers.ValidationError({
                    "cantidad": (
                        "El importe supera el máximo permitido."
                    )
                })

        return attrs

    def create(self, validated_data):
        servicio = validated_data["servicio"]
        cantidad = validated_data["cantidad"]

        validated_data["total"] = (
            servicio.precio * cantidad
        )

        return super().create(validated_data)

    def update(self, instance, validated_data):
        servicio = validated_data.get(
            "servicio",
            instance.servicio
        )

        cantidad = validated_data.get(
            "cantidad",
            instance.cantidad
        )

        validated_data["total"] = (
            servicio.precio * cantidad
        )

        return super().update(
            instance,
            validated_data
        )


class HabitacionSerializer(serializers.ModelSerializer):

    class Meta:
        model = Habitacion
        fields = "__all__"


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
            "estado",
        ]
