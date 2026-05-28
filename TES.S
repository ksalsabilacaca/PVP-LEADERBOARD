#include <avr/io.h>
#include <util/delay.h>
#include <stdint.h>

#define VREF_MV 5000UL
#define FAN_PIN PB1

void adc_init(void) {
    /*
      REFS0 = 1  -> referensi ADC menggunakan AVCC
      MUX[3:0] = 0000 -> input ADC0
    */
    ADMUX = (1 << REFS0);

    /*
      ADEN = 1 -> enable ADC
      ADPS2:0 = 111 -> prescaler 128
      Jika clock CPU 16 MHz, clock ADC = 16 MHz / 128 = 125 kHz
    */
    ADCSRA = (1 << ADEN) |
             (1 << ADPS2) | (1 << ADPS1) | (1 << ADPS0);

    /*
      Matikan digital input buffer pada ADC0
      agar noise dan konsumsi daya lebih kecil.
    */
    DIDR0 = (1 << ADC0D);
}

uint16_t adc_read(uint8_t channel) {
    channel &= 0x07;

    /*
      Pilih channel ADC tanpa mengubah referensi AVCC.
    */
    ADMUX = (1 << REFS0) | channel;

    /*
      Mulai konversi ADC.
    */
    ADCSRA |= (1 << ADSC);

    /*
      Tunggu sampai ADSC kembali 0,
      artinya konversi selesai.
    */
    while (ADCSRA & (1 << ADSC));

    /*
      Register ADC otomatis membaca ADCL dan ADCH
      dengan urutan benar melalui macro ADC.
    */
    return ADC;
}

uint16_t read_temperature_x10(void) {
    uint32_t sum = 0;

    /*
      Ambil 16 sampel untuk mengurangi noise.
    */
    for (uint8_t i = 0; i < 16; i++) {
        sum += adc_read(0);
        _delay_ms(5);
    }

    uint16_t adc_avg = sum / 16;

    /*
      Vout_mV = ADC * VREF / 1024
      LM35: 10 mV = 1°C

      Karena ingin suhu x10:
      30.0°C ditulis 300.

      Temp_x10 = Vout_mV
      Contoh: Vout 300 mV -> 30.0°C -> Temp_x10 = 300
    */
    uint16_t temp_x10 = (adc_avg * VREF_MV) / 1024;

    return temp_x10;
}

int main(void) {
    adc_init();

    DDRB |= (1 << FAN_PIN);

    uint8_t fan_state = 0;

    while (1) {
        uint16_t suhu = read_temperature_x10();

        /*
          Hysteresis:
          suhu >= 30.0°C -> fan ON
          suhu <= 28.0°C -> fan OFF
        */
        if (suhu >= 300) {
            fan_state = 1;
        } else if (suhu <= 280) {
            fan_state = 0;
        }

        if (fan_state) {
            PORTB |= (1 << FAN_PIN);
        } else {
            PORTB &= ~(1 << FAN_PIN);
        }

        _delay_ms(500);
    }
}