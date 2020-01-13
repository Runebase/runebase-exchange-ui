/* eslint-disable react/destructuring-assignment */
import React, { Component, useEffect, useRef } from 'react';
import { inject, observer } from 'mobx-react';
import { createChart, CrosshairMode } from 'lightweight-charts';
import './style.css';

export default @inject('store') @observer class ChartComponent extends Component {
  componentDidMount() {
    this.props.store.priceChartStore.getChartInfo();
  }

  render() {
    const { store: { priceChartStore } } = this.props;
    if (priceChartStore.chartInfo == null) {
      return <div>Loading...</div>;
    }
    function ChartLight() {
      const chartContainerRef = useRef();
      const chart = useRef();
      const resizeObserver = useRef();

      useEffect(() => {
        chart.current = createChart(chartContainerRef.current, {
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
          layout: {
            backgroundColor: '#253248',
            textColor: 'rgba(255, 255, 255, 0.9)',
          },
          grid: {
            vertLines: {
              color: '#334158',
            },
            horzLines: {
              color: '#334158',
            },
          },
          crosshair: {
            mode: CrosshairMode.Normal,
          },
          priceScale: {
            borderColor: '#485c7b',
          },
          timeScale: {
            borderColor: '#485c7b',
          },
        });

        console.log(chart.current);

        const candleSeries = chart.current.addCandlestickSeries({
          upColor: '#4bffb5',
          downColor: '#ff4976',
          borderDownColor: '#ff4976',
          borderUpColor: '#4bffb5',
          wickDownColor: '#838ca1',
          wickUpColor: '#838ca1',
        });

        candleSeries.setData([
          {
            time: '2018-10-19',
            open: 180.34,
            high: 180.99,
            low: 178.57,
            close: 179.85,
          },
          {
            time: '2018-10-22',
            open: 180.82,
            high: 181.4,
            low: 177.56,
            close: 178.75,
          },
          {
            time: '2018-10-23',
            open: 175.77,
            high: 179.49,
            low: 175.44,
            close: 178.53,
          },
          {
            time: '2018-10-24',
            open: 178.58,
            high: 182.37,
            low: 176.31,
            close: 176.97,
          },
          {
            time: '2018-10-25',
            open: 177.52,
            high: 180.5,
            low: 176.83,
            close: 179.07,
          },
        ],);

        // const areaSeries = chart.current.addAreaSeries({
        //   topColor: 'rgba(38,198,218, 0.56)',
        //   bottomColor: 'rgba(38,198,218, 0.04)',
        //   lineColor: 'rgba(38,198,218, 1)',
        //   lineWidth: 2
        // });

        // areaSeries.setData(areaData);

        const volumeSeries = chart.current.addHistogramSeries({
          color: '#182233',
          lineWidth: 2,
          priceFormat: {
            type: 'volume',
          },
          overlay: true,
          scaleMargins: {
            top: 0.8,
            bottom: 0,
          },
        });

        volumeSeries.setData([
          { time: '2018-10-19', value: 19103293.0 },
          { time: '2018-10-22', value: 21737523.0 },
        ],);
      }, []);

      // Resize chart on container resizes.
      useEffect(() => {
        resizeObserver.current = new ResizeObserver(entries => {
          const { width, height } = entries[0].contentRect;
          chart.current.applyOptions({ width, height });
          setTimeout(() => {
            chart.current.timeScale().fitContent();
          }, 0);
        });

        resizeObserver.current.observe(chartContainerRef.current);

        return () => resizeObserver.current.disconnect();
      }, []);

      return (
        <div ref={chartContainerRef} className="chart-container" />
      );
    }

    return (
      <div>
        <ChartLight />
      </div>
    );
  }
}
