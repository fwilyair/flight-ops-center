import { Composition } from 'remotion';
import { FlightOpsInkPress, TOTAL } from './flightops/Main';

export const Root: React.FC = () => {
  return (
    <Composition
      id="FlightOpsInkPress"
      component={FlightOpsInkPress}
      durationInFrames={TOTAL}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};
