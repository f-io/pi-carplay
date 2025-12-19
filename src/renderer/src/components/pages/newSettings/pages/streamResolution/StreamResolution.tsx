import { StreamResolutionProps } from './types'
import NumberSpinner from '../../components/numberSpinner/numberSpinner'

export const StreamResolution: React.FC<StreamResolutionProps> = ({ state, onChange }) => {
  return (
    <>
      <div style={{ marginTop: 16 }}>
        <NumberSpinner
          id="width"
          label="Width"
          size="small"
          value={state?.width}
          onValueChange={(v) => onChange(Number(v))}
        />

        <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry.</p>
      </div>

      <br />

      <div>
        <NumberSpinner
          id="height"
          label="Height"
          size="small"
          value={state?.height}
          onValueChange={(v) => onChange(Number(v))}
        />

        <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry.</p>
      </div>
    </>
  )
}
