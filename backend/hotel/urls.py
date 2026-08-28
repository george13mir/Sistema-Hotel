from django.urls import path, include

from rest_framework.routers import DefaultRouter

from .views import (
    EmpleadoViewSet,
    ServicioViewSet,
    ConsumoServicioViewSet,
    HabitacionViewSet,
    ReservaViewSet
)


router = DefaultRouter()


router.register(
    'empleados',
    EmpleadoViewSet
)


router.register(
    'servicios',
    ServicioViewSet
)


router.register(
    'consumos',
    ConsumoServicioViewSet
)

router.register(
    'habitaciones',
    HabitacionViewSet
)

router.register('reservas', ReservaViewSet)

urlpatterns = [

    path('', include(router.urls)),

]